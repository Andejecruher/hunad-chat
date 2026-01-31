<?php

namespace App\Http\Controllers\AI;

use App\Exceptions\ToolExecutionException;
use App\Exceptions\ToolSchemaValidationException;
use App\Http\Controllers\Controller;
use App\Models\AiAgent;
use App\Models\ToolExecution;
use App\Services\AI\ToolExecutor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Controlador para la ejecución de herramientas por agentes de IA
 * 
 * Maneja:
 * - Ejecución asíncrona y síncrona de herramientas
 * - Consulta de resultados de ejecuciones
 * - Estadísticas de ejecución
 */
class ToolExecutionController extends Controller
{
    public function __construct(
        private ToolExecutor $toolExecutor
    ) {}

    /**
     * Ejecutar una herramienta de forma asíncrona
     * 
     * POST /api/ai/agents/{agent}/tools/{toolSlug}/execute
     * 
     * @param AiAgent $agent
     * @param string $toolSlug
     * @param Request $request
     * @return JsonResponse
     */
    public function execute(AiAgent $agent, string $toolSlug, Request $request): JsonResponse
    {
        // Verificar acceso
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        try {
            $request->validate([
                'payload' => 'required|array',
                'sync' => 'boolean',
            ]);

            $payload = $request->input('payload', []);
            $sync = $request->boolean('sync', false);

            // Ejecutar herramienta
            $execution = $sync 
                ? $this->toolExecutor->executeSync($agent, $toolSlug, $payload)
                : $this->toolExecutor->execute($agent, $toolSlug, $payload);

            return response()->json([
                'success' => true,
                'data' => [
                    'execution_id' => $execution->id,
                    'status' => $execution->status,
                    'result' => $execution->result,
                    'error' => $execution->error,
                    'created_at' => $execution->created_at,
                    'updated_at' => $execution->updated_at,
                ],
                'meta' => [
                    'agent_id' => $agent->id,
                    'tool_slug' => $toolSlug,
                    'execution_mode' => $sync ? 'synchronous' : 'asynchronous',
                ],
            ], $sync && $execution->status === 'success' ? 200 : 202);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation error',
                'details' => $e->errors(),
            ], 422);

        } catch (ToolExecutionException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Tool execution error',
                'message' => $e->getMessage(),
            ], 400);

        } catch (ToolSchemaValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Schema validation error',
                'message' => $e->getMessage(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Internal error',
                'message' => 'An unexpected error occurred',
            ], 500);
        }
    }

    /**
     * Obtener resultado de una ejecución específica
     * 
     * GET /api/ai/agents/{agent}/executions/{execution}
     * 
     * @param AiAgent $agent
     * @param ToolExecution $execution
     * @return JsonResponse
     */
    public function show(AiAgent $agent, ToolExecution $execution): JsonResponse
    {
        // Verificar que la ejecución pertenece al agente y empresa correcta
        if ($execution->ai_agent_id !== $agent->id || $agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Execution not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $execution->id,
                'tool' => [
                    'id' => $execution->tool->id,
                    'slug' => $execution->tool->slug,
                    'name' => $execution->tool->name,
                    'type' => $execution->tool->type,
                    'category' => $execution->tool->category,
                ],
                'payload' => $execution->payload,
                'status' => $execution->status,
                'result' => $execution->result,
                'error' => $execution->error,
                'created_at' => $execution->created_at,
                'updated_at' => $execution->updated_at,
                'duration_ms' => $execution->updated_at->diffInMilliseconds($execution->created_at),
            ],
            'meta' => [
                'agent_id' => $agent->id,
                'execution_id' => $execution->id,
            ],
        ]);
    }

    /**
     * Listar ejecuciones de un agente con filtros
     * 
     * GET /api/ai/agents/{agent}/executions
     * 
     * @param AiAgent $agent
     * @param Request $request
     * @return JsonResponse
     */
    public function index(AiAgent $agent, Request $request): JsonResponse
    {
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $request->validate([
            'status' => 'in:accepted,running,success,failed',
            'tool_slug' => 'string',
            'from' => 'date',
            'to' => 'date',
            'per_page' => 'integer|min:1|max:100',
        ]);

        $filters = $request->only(['status', 'tool_slug', 'from', 'to', 'per_page']);
        $executions = $this->toolExecutor->getExecutions($agent, $filters);

        return response()->json([
            'success' => true,
            'data' => $executions->items(),
            'meta' => [
                'agent_id' => $agent->id,
                'current_page' => $executions->currentPage(),
                'last_page' => $executions->lastPage(),
                'per_page' => $executions->perPage(),
                'total' => $executions->total(),
                'filters' => $filters,
            ],
        ]);
    }

    /**
     * Obtener estadísticas de ejecución para un agente
     * 
     * GET /api/ai/agents/{agent}/executions/stats
     * 
     * @param AiAgent $agent
     * @param Request $request
     * @return JsonResponse
     */
    public function stats(AiAgent $agent, Request $request): JsonResponse
    {
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $request->validate([
            'period' => 'in:1 day,1 week,1 month,3 months',
        ]);

        $period = $request->input('period');
        $stats = $this->toolExecutor->getExecutionStats($agent, $period);

        return response()->json([
            'success' => true,
            'data' => $stats,
            'meta' => [
                'agent_id' => $agent->id,
                'period' => $period ?? 'all_time',
                'generated_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Cancelar una ejecución pendiente (si es posible)
     * 
     * DELETE /api/ai/agents/{agent}/executions/{execution}
     * 
     * @param AiAgent $agent
     * @param ToolExecution $execution
     * @return JsonResponse
     */
    public function cancel(AiAgent $agent, ToolExecution $execution): JsonResponse
    {
        if ($execution->ai_agent_id !== $agent->id || $agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Execution not found'], 404);
        }

        // Solo se pueden cancelar ejecuciones en estado 'accepted'
        if ($execution->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'error' => 'Cannot cancel execution',
                'message' => "Execution is in '{$execution->status}' status and cannot be cancelled",
            ], 400);
        }

        // Marcar como cancelada
        $execution->update([
            'status' => 'cancelled',
            'error' => [
                'message' => 'Execution cancelled by request',
                'cancelled_at' => now()->toISOString(),
                'cancelled_by' => Auth::id(),
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Execution cancelled successfully',
            'data' => [
                'execution_id' => $execution->id,
                'status' => $execution->status,
                'cancelled_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Reejecutar una herramienta fallida
     * 
     * POST /api/ai/agents/{agent}/executions/{execution}/retry
     * 
     * @param AiAgent $agent
     * @param ToolExecution $execution
     * @param Request $request
     * @return JsonResponse
     */
    public function retry(AiAgent $agent, ToolExecution $execution, Request $request): JsonResponse
    {
        if ($execution->ai_agent_id !== $agent->id || $agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Execution not found'], 404);
        }

        // Solo se pueden reintentar ejecuciones fallidas
        if ($execution->status !== 'failed') {
            return response()->json([
                'success' => false,
                'error' => 'Cannot retry execution',
                'message' => "Execution is in '{$execution->status}' status and cannot be retried",
            ], 400);
        }

        try {
            $sync = $request->boolean('sync', false);
            $tool = $execution->tool;

            // Crear nueva ejecución con el mismo payload
            $newExecution = $sync 
                ? $this->toolExecutor->executeSync($agent, $tool->slug, $execution->payload)
                : $this->toolExecutor->execute($agent, $tool->slug, $execution->payload);

            return response()->json([
                'success' => true,
                'message' => 'Tool execution retried successfully',
                'data' => [
                    'original_execution_id' => $execution->id,
                    'new_execution_id' => $newExecution->id,
                    'status' => $newExecution->status,
                    'result' => $newExecution->result,
                    'execution_mode' => $sync ? 'synchronous' : 'asynchronous',
                ],
            ], $sync && $newExecution->status === 'success' ? 200 : 202);

        } catch (ToolExecutionException | ToolSchemaValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Retry failed',
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}