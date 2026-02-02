<?php

namespace App\Services\AI\MCP;

use App\Models\Tool;

/**
 * Mapeador de herramientas al formato Model Context Protocol (MCP)
 *
 * Se encarga de convertir herramientas internas al formato estándar MCP
 * para interoperabilidad con diferentes proveedores de IA (Claude, OpenAI, etc.)
 */
class MCPToolMapper
{
    /**
     * Convertir herramientas al formato MCP estándar
     *
     * @param  \Illuminate\Support\Collection|\Illuminate\Database\Eloquent\Collection  $tools
     */
    public function toMCPFormat($tools): array
    {
        return [
            'tools' => $tools->map(function (Tool $tool) {
                return $this->mapTool($tool);
            })->toArray(),
            'version' => config('mcp.version', '1.0.0'),
            'protocol' => config('mcp.protocol', 'mcp'),
        ];
    }

    /**
     * Mapear una herramienta individual al formato MCP
     */
    public function mapTool(Tool $tool): array
    {
        return [
            'name' => $tool->slug,
            'description' => $tool->name,
            'inputSchema' => $this->buildMCPInputSchema($tool->schema['inputs'] ?? []),
            'outputSchema' => $this->buildMCPOutputSchema($tool->schema['outputs'] ?? []),
            'metadata' => [
                'category' => $tool->category,
                'type' => $tool->type,
                'company_id' => $tool->company_id,
                'last_executed_at' => $tool->last_executed_at?->toISOString(),
            ],
        ];
    }

    /**
     * Construir schema de entrada compatible con MCP
     */
    private function buildMCPInputSchema(array $inputs): array
    {
        if (empty($inputs)) {
            return [
                'type' => 'object',
                'properties' => [],
                'required' => [],
            ];
        }

        $properties = [];
        $required = [];

        foreach ($inputs as $input) {
            $fieldName = $input['name'];
            $properties[$fieldName] = [
                'type' => $this->mapTypeToJSONSchema($input['type']),
                'description' => $input['description'] ?? '',
            ];

            if ($input['required'] ?? false) {
                $required[] = $fieldName;
            }
        }

        return [
            'type' => 'object',
            'properties' => $properties,
            'required' => $required,
        ];
    }

    /**
     * Construir schema de salida compatible con MCP
     */
    private function buildMCPOutputSchema(array $outputs): array
    {
        if (empty($outputs)) {
            return [
                'type' => 'object',
                'properties' => [],
            ];
        }

        $properties = [];

        foreach ($outputs as $output) {
            $fieldName = $output['name'];
            $properties[$fieldName] = [
                'type' => $this->mapTypeToJSONSchema($output['type']),
                'description' => $output['description'] ?? '',
            ];
        }

        return [
            'type' => 'object',
            'properties' => $properties,
        ];
    }

    /**
     * Mapear tipos internos a tipos de JSON Schema compatibles con MCP
     */
    private function mapTypeToJSONSchema(string $internalType): string
    {
        return match ($internalType) {
            'string' => 'string',
            'number' => 'number',
            'integer' => 'integer',
            'boolean' => 'boolean',
            'array' => 'array',
            'object' => 'object',
            default => 'string', // Fallback seguro
        };
    }

    /**
     * Crear respuesta MCP para ejecución de herramienta
     */
    public function createMCPResponse(Tool $tool, array $result = [], bool $success = true, ?string $error = null): array
    {
        return [
            'toolName' => $tool->slug,
            'success' => $success,
            'result' => $success ? $result : null,
            'error' => $error,
            'timestamp' => now()->toISOString(),
            'metadata' => [
                'tool_type' => $tool->type,
                'category' => $tool->category,
                'company_id' => $tool->company_id,
            ],
        ];
    }

    /**
     * Crear manifest MCP para el servidor
     *
     * @param  \Illuminate\Support\Collection|\Illuminate\Database\Eloquent\Collection  $tools
     */
    public function createMCPManifest($tools, array $serverInfo = []): array
    {
        return [
            'protocol' => config('mcp.protocol', 'mcp'),
            'version' => config('mcp.version', '1.0.0'),
            'server' => array_merge([
                'name' => 'HunadChat Tool Server',
                'version' => '1.0.0',
                'description' => 'Multi-tenant AI tool execution server',
            ], $serverInfo),
            'capabilities' => [
                'tools' => true,
                'async_execution' => true,
                'schema_validation' => true,
                'multi_tenant' => true,
            ],
            'tools' => $this->toMCPFormat($tools)['tools'],
            'stats' => [
                'total_tools' => $tools->count(),
                'internal_tools' => $tools->where('type', 'internal')->count(),
                'external_tools' => $tools->where('type', 'external')->count(),
                'categories' => $tools->pluck('category')->unique()->values()->toArray(),
            ],
        ];
    }

    /**
     * Validar que un payload MCP es compatible con nuestro formato interno
     *
     * @return array Payload normalizado para uso interno
     */
    public function normalizeMCPPayload(array $mcpPayload): array
    {
        // El payload MCP debería venir en el formato correcto ya
        // Pero podemos hacer alguna normalización si es necesario
        return $mcpPayload;
    }

    /**
     * Crear error MCP estándar
     */
    public function createMCPError(string $code, string $message, array $details = []): array
    {
        return [
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details,
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}
