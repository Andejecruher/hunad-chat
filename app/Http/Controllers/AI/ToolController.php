<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AiAgent;
use App\Services\AI\MCP\MCPToolMapper;
use App\Services\AI\ToolRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controller to expose available tools to AI agents
 *
 * Endpoints intended for consumption by AI agents and MCP systems
 * NOT for the web user interface
 */
class ToolController extends Controller
{
    public function __construct(
        private ToolRegistry $toolRegistry,
        private MCPToolMapper $mcpMapper
    ) {}

    /**
     * List available tools for a specific agent
     *
     * GET /api/ai/agents/{agent}/tools
     */
    public function index(AiAgent $agent, Request $request): JsonResponse
    {
        // Verify that the agent belongs to the authenticated user's company
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $tools = $this->toolRegistry->getAvailableToolsForAgent($agent);

        // Determine response format
        $format = $request->get('format', 'standard');

        $response = match ($format) {
            'mcp' => $this->mcpMapper->toMCPFormat($tools),
            'normalized' => $this->toolRegistry->normalizeToolsForAI($tools),
            default => $tools->map(function ($tool) {
                return [
                    'id' => $tool->id,
                    'slug' => $tool->slug,
                    'name' => $tool->name,
                    'type' => $tool->type,
                    'category' => $tool->category,
                    'schema' => $tool->schema,
                    'enabled' => $tool->enabled,
                    'last_executed_at' => $tool->last_executed_at,
                ];
            }),
        };

        return response()->json([
            'success' => true,
            'data' => $response,
            'meta' => [
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'company_id' => $agent->company_id,
                'total_tools' => $tools->count(),
                'format' => $format,
            ],
        ]);
    }

    /**
     * Obtener una herramienta específica
     *
     * GET /api/ai/agents/{agent}/tools/{toolSlug}
     */
    public function show(AiAgent $agent, string $toolSlug, Request $request): JsonResponse
    {
        // Verificar acceso del agente
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $tool = $this->toolRegistry->getToolForAgent($agent, $toolSlug);

        if (! $tool) {
            return response()->json([
                'error' => 'Tool not found or not accessible',
                'tool_slug' => $toolSlug,
            ], 404);
        }

        $format = $request->get('format', 'standard');

        $response = match ($format) {
            'mcp' => $this->mcpMapper->mapTool($tool),
            default => [
                'id' => $tool->id,
                'slug' => $tool->slug,
                'name' => $tool->name,
                'type' => $tool->type,
                'category' => $tool->category,
                'schema' => $tool->schema,
                'config' => $this->sanitizeConfig($tool->config),
                'enabled' => $tool->enabled,
                'last_executed_at' => $tool->last_executed_at,
                'last_error' => $tool->last_error,
            ],
        };

        return response()->json([
            'success' => true,
            'data' => $response,
            'meta' => [
                'agent_id' => $agent->id,
                'format' => $format,
            ],
        ]);
    }

    /**
     * Listar herramientas por categoría
     *
     * GET /api/ai/agents/{agent}/tools/category/{category}
     */
    public function byCategory(AiAgent $agent, string $category, Request $request): JsonResponse
    {
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $tools = $this->toolRegistry->getToolsByCategory($agent, $category);
        $format = $request->get('format', 'standard');

        $response = match ($format) {
            'mcp' => $this->mcpMapper->toMCPFormat($tools),
            'normalized' => $this->toolRegistry->normalizeToolsForAI($tools),
            default => $tools->map(function ($tool) {
                return [
                    'id' => $tool->id,
                    'slug' => $tool->slug,
                    'name' => $tool->name,
                    'type' => $tool->type,
                    'schema' => $tool->schema,
                    'enabled' => $tool->enabled,
                ];
            }),
        };

        return response()->json([
            'success' => true,
            'data' => $response,
            'meta' => [
                'agent_id' => $agent->id,
                'category' => $category,
                'total_tools' => $tools->count(),
                'format' => $format,
            ],
        ]);
    }

    /**
     * Obtener estadísticas de herramientas para un agente
     *
     * GET /api/ai/agents/{agent}/tools/stats
     */
    public function stats(AiAgent $agent): JsonResponse
    {
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $stats = $this->toolRegistry->getToolStats($agent);

        return response()->json([
            'success' => true,
            'data' => $stats,
            'meta' => [
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'company_id' => $agent->company_id,
            ],
        ]);
    }

    /**
     * Generar manifest MCP para un agente
     *
     * GET /api/ai/agents/{agent}/mcp/manifest
     */
    public function mcpManifest(AiAgent $agent, Request $request): JsonResponse
    {
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $tools = $this->toolRegistry->getAvailableToolsForAgent($agent);

        $serverInfo = [
            'name' => "HunadChat Tools for {$agent->name}",
            'description' => "Tool server for AI agent {$agent->name}",
            'agent_id' => $agent->id,
            'company_id' => $agent->company_id,
        ];

        $manifest = $this->mcpMapper->createMCPManifest($tools, $serverInfo);

        return response()->json($manifest);
    }

    /**
     * Sanitizar configuración para no exponer secretos
     */
    private function sanitizeConfig(array $config): array
    {
        // Clone the configuration
        $sanitized = $config;

        // Hide sensitive fields
        if (isset($sanitized['headers'])) {
            foreach ($sanitized['headers'] as &$header) {
                if (isset($header['key']) && str_contains(strtolower($header['key']), 'auth')) {
                    $header['value'] = '***';
                }
            }
        }

        if (isset($sanitized['auth'])) {
            foreach ($sanitized['auth'] as $key => $value) {
                if (in_array($key, ['token', 'password', 'key', 'secret'])) {
                    $sanitized['auth'][$key] = '***';
                }
            }
        }

        return $sanitized;
    }
}
