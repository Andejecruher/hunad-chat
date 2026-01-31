<?php

namespace App\Services\AI;

use App\Exceptions\ToolExecutionException;
use App\Exceptions\ToolSchemaValidationException;
use App\Jobs\ExecuteToolJob;
use App\Models\AiAgent;
use App\Models\Tool;
use App\Models\ToolExecution;
use Illuminate\Support\Facades\Log;

/**
 * Orquestador principal de ejecución de herramientas
 * 
 * Se encarga de:
 * - Validar acceso del agente a la herramienta
 * - Validar payload contra schema
 * - Crear registro de ejecución
 * - Despachar job asíncrono
 */
class ToolExecutor
{
    public function __construct(
        private ToolRegistry $toolRegistry,
        private ToolValidator $toolValidator
    ) {}

    /**
     * Ejecutar una herramienta de forma asíncrona
     * 
     * @param AiAgent $agent
     * @param string $toolSlug
     * @param array $payload
     * @return ToolExecution
     * @throws ToolExecutionException
     * @throws ToolSchemaValidationException
     */
    public function execute(AiAgent $agent, string $toolSlug, array $payload): ToolExecution
    {
        // 1. Obtener la herramienta
        $tool = $this->toolRegistry->getToolForAgent($agent, $toolSlug);
        if (!$tool) {
            throw ToolExecutionException::toolNotFound($toolSlug);
        }

        // 2. Verificar que está habilitada
        if (!$tool->enabled) {
            throw ToolExecutionException::toolDisabled($tool->name);
        }

        // 3. Verificar acceso del agente
        if (!$this->toolRegistry->canAgentAccessTool($agent, $tool)) {
            throw ToolExecutionException::agentNotAuthorized($agent->id, $tool->name);
        }

        // 4. Validar payload
        $this->toolValidator->validatePayload($tool, $payload);

        // 5. Crear registro de ejecución en estado 'accepted'
        $execution = $this->createExecution($tool, $agent, $payload);

        // 6. Despachar job asíncrono
        ExecuteToolJob::dispatch($execution);

        Log::info('Tool execution initiated', [
            'execution_id' => $execution->id,
            'tool_slug' => $tool->slug,
            'agent_id' => $agent->id,
            'company_id' => $agent->company_id,
        ]);

        return $execution;
    }

    /**
     * Ejecutar herramienta de forma síncrona (para testing principalmente)
     * 
     * @param AiAgent $agent
     * @param string $toolSlug
     * @param array $payload
     * @return ToolExecution
     */
    public function executeSync(AiAgent $agent, string $toolSlug, array $payload): ToolExecution
    {
        $execution = $this->execute($agent, $toolSlug, $payload);
        
        // Ejecutar inmediatamente
        $job = new ExecuteToolJob($execution);
        $job->handle();

        // Refrescar modelo para obtener resultado actualizado
        return $execution->fresh();
    }

    /**
     * Crear registro de ejecución
     * 
     * @param Tool $tool
     * @param AiAgent $agent
     * @param array $payload
     * @return ToolExecution
     */
    private function createExecution(Tool $tool, AiAgent $agent, array $payload): ToolExecution
    {
        return ToolExecution::create([
            'tool_id' => $tool->id,
            'ai_agent_id' => $agent->id,
            'payload' => $payload,
            'status' => 'accepted',
            'result' => null,
            'error' => null,
        ]);
    }

    /**
     * Obtener ejecuciones de un agente con filtros opcionales
     * 
     * @param AiAgent $agent
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getExecutions(AiAgent $agent, array $filters = [])
    {
        $query = ToolExecution::query()
            ->where('ai_agent_id', $agent->id)
            ->with(['tool'])
            ->orderBy('created_at', 'desc');

        // Filtro por status
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filtro por herramienta
        if (isset($filters['tool_slug'])) {
            $query->whereHas('tool', function ($q) use ($filters) {
                $q->where('slug', $filters['tool_slug']);
            });
        }

        // Filtro por rango de fechas
        if (isset($filters['from'])) {
            $query->where('created_at', '>=', $filters['from']);
        }
        
        if (isset($filters['to'])) {
            $query->where('created_at', '<=', $filters['to']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Obtener estadísticas de ejecuciones para un agente
     * 
     * @param AiAgent $agent
     * @param string|null $period
     * @return array
     */
    public function getExecutionStats(AiAgent $agent, ?string $period = null): array
    {
        $query = ToolExecution::where('ai_agent_id', $agent->id);

        // Filtrar por período si se especifica
        if ($period) {
            $query->where('created_at', '>=', now()->sub($period));
        }

        $executions = $query->get();

        return [
            'total_executions' => $executions->count(),
            'successful_executions' => $executions->where('status', 'success')->count(),
            'failed_executions' => $executions->where('status', 'failed')->count(),
            'pending_executions' => $executions->where('status', 'accepted')->count(),
            'success_rate' => $this->calculateSuccessRate($executions),
            'most_used_tools' => $this->getMostUsedTools($executions),
        ];
    }

    /**
     * Calcular tasa de éxito
     * 
     * @param \Illuminate\Support\Collection $executions
     * @return float
     */
    private function calculateSuccessRate($executions): float
    {
        $completed = $executions->whereIn('status', ['success', 'failed']);
        
        if ($completed->isEmpty()) {
            return 0.0;
        }

        $successful = $completed->where('status', 'success');
        return ($successful->count() / $completed->count()) * 100;
    }

    /**
     * Obtener herramientas más utilizadas
     * 
     * @param \Illuminate\Support\Collection $executions
     * @return array
     */
    private function getMostUsedTools($executions): array
    {
        return $executions
            ->groupBy('tool_id')
            ->map(function ($group) {
                return [
                    'tool_name' => $group->first()->tool->name ?? 'Unknown',
                    'count' => $group->count(),
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->take(5)
            ->toArray();
    }
}