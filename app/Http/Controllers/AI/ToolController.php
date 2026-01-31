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
 * Controlador para exponer herramientas disponibles a agentes de IA
 * 
 * Endpoints destinados al consumo por agentes de IA y sistemas MCP
 * NO para interfaz de usuario web
 */
class ToolController extends Controller
{
    public function __construct(
        private ToolRegistry $toolRegistry,
        private MCPToolMapper $mcpMapper
    ) {}

    /**
     * Listar herramientas disponibles para un agente específico
     * 
     * GET /api/ai/agents/{agent}/tools
     * 
     * @param AiAgent $agent
     * @param Request $request
     * @return JsonResponse
     */
    public function index(AiAgent $agent, Request $request): JsonResponse
    {
        // Verificar que el agente pertenece a la empresa del usuario autenticado
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $tools = $this->toolRegistry->getAvailableToolsForAgent($agent);

        // Determinar formato de respuesta
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
     * 
     * @param AiAgent $agent
     * @param string $toolSlug
     * @param Request $request
     * @return JsonResponse
     */
    public function show(AiAgent $agent, string $toolSlug, Request $request): JsonResponse
    {
        // Verificar acceso del agente
        if ($agent->company_id !== Auth::user()->company_id) {
            return response()->json(['error' => 'Agent not found'], 404);
        }

        $tool = $this->toolRegistry->getToolForAgent($agent, $toolSlug);

        if (!$tool) {
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
     * 
     * @param AiAgent $agent
     * @param string $category
     * @param Request $request
     * @return JsonResponse
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
     * 
     * @param AiAgent $agent
     * @return JsonResponse
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
     * 
     * @param AiAgent $agent
     * @param Request $request
     * @return JsonResponse
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
     * 
     * @param array $config
     * @return array
     */
    private function sanitizeConfig(array $config): array
    {
        // Clonar la configuración
        $sanitized = $config;

        // Ocultar campos sensibles
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