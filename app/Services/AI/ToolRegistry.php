<?php

namespace App\Services\AI;

use App\Models\AiAgent;
use App\Models\Tool;
use Illuminate\Database\Eloquent\Collection;

/**
 * Servicio para consulta y exposición de herramientas disponibles para agentes IA
 *
 * Se encarga de:
 * - Listar tools habilitadas para un agente específico
 * - Filtrar por company_id para multi-tenancy
 * - Normalizar la respuesta para consumo por IA
 */
class ToolRegistry
{
    /**
     * Obtener todas las herramientas disponibles para un agente
     *
     * @return Collection<Tool>
     */
    public function getAvailableToolsForAgent(AiAgent $agent): Collection
    {
        return $agent->tools()
            ->where('enabled', true)
            ->where('company_id', $agent->company_id)
            ->get();
    }

    /**
     * Obtener una herramienta específica para un agente
     */
    public function getToolForAgent(AiAgent $agent, string $toolSlug): ?Tool
    {
        return $agent->tools()
            ->where('enabled', true)
            ->where('company_id', $agent->company_id)
            ->where('slug', $toolSlug)
            ->first();
    }

    /**
     * Verificar si un agente tiene acceso a una herramienta específica
     */
    public function canAgentAccessTool(AiAgent $agent, Tool $tool): bool
    {
        // Verificar que pertenecen a la misma empresa
        if ($agent->company_id !== $tool->company_id) {
            return false;
        }

        // Verificar que la herramienta esté habilitada
        if (! $tool->enabled) {
            return false;
        }

        // Verificar que el agente tenga la herramienta asignada
        return $agent->tools()->where('tool_id', $tool->id)->exists();
    }

    /**
     * Normalizar herramientas para consumo por IA
     * Formato estándar para diferentes providers (no específico de OpenAI)
     *
     * @param  \Illuminate\Support\Collection|\Illuminate\Database\Eloquent\Collection  $tools
     */
    public function normalizeToolsForAI($tools): array
    {
        return $tools->map(function (Tool $tool) {
            return [
                'name' => $tool->slug,
                'description' => $tool->name,
                'input_schema' => $this->normalizeInputSchema($tool->schema['inputs'] ?? []),
                'output_schema' => $this->normalizeOutputSchema($tool->schema['outputs'] ?? []),
                'category' => $tool->category,
                'type' => $tool->type,
            ];
        })->toArray();
    }

    /**
     * Normalizar schema de entrada
     */
    private function normalizeInputSchema(array $inputs): array
    {
        $properties = [];
        $required = [];

        foreach ($inputs as $input) {
            $properties[$input['name']] = [
                'type' => $input['type'],
                'description' => $input['description'] ?? '',
            ];

            if ($input['required'] ?? false) {
                $required[] = $input['name'];
            }
        }

        return [
            'type' => 'object',
            'properties' => $properties,
            'required' => $required,
        ];
    }

    /**
     * Normalizar schema de salida
     */
    private function normalizeOutputSchema(array $outputs): array
    {
        $properties = [];

        foreach ($outputs as $output) {
            $properties[$output['name']] = [
                'type' => $output['type'],
                'description' => $output['description'] ?? '',
            ];
        }

        return [
            'type' => 'object',
            'properties' => $properties,
        ];
    }

    /**
     * Buscar herramientas por categoría para un agente
     *
     * @return Collection<Tool>
     */
    public function getToolsByCategory(AiAgent $agent, string $category): Collection
    {
        return $agent->tools()
            ->where('enabled', true)
            ->where('company_id', $agent->company_id)
            ->where('category', $category)
            ->get();
    }

    /**
     * Obtener estadísticas de herramientas para un agente
     */
    public function getToolStats(AiAgent $agent): array
    {
        $tools = $this->getAvailableToolsForAgent($agent);

        return [
            'total_tools' => $tools->count(),
            'internal_tools' => $tools->where('type', 'internal')->count(),
            'external_tools' => $tools->where('type', 'external')->count(),
            'categories' => $tools->pluck('category')->unique()->values()->toArray(),
        ];
    }
}
