<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Models\Tool;
use App\Services\AI\ToolValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Controlador para la gestión de herramientas de IA desde la interfaz web
 * 
 * Maneja el CRUD completo de herramientas para administradores
 */
class IaToolController extends Controller
{
    public function __construct(
        private ToolValidator $toolValidator
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:all,enabled,disabled',
            'type' => 'nullable|in:all,internal,external',
            'category' => 'nullable|string',
            'limit' => 'nullable|integer|min:5|max:100',
        ]);

        $query = Tool::query()
            ->where('company_id', Auth::user()->company_id)
            ->with(['executions' => function ($query) {
                $query->latest()->limit(5);
            }]);

        // Filtro por búsqueda
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filtro por estado
        if ($request->input('status') === 'enabled') {
            $query->where('enabled', true);
        } elseif ($request->input('status') === 'disabled') {
            $query->where('enabled', false);
        }

        // Filtro por tipo
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        // Filtro por categoría
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Ordenamiento
        $query->orderBy('updated_at', 'desc');

        $limit = $request->input('limit', 15);
        $tools = $query->paginate($limit);

        return inertia('management/ia-tools/index', [
            'tools' => $tools,
            'filters' => $request->only(['search', 'status', 'type', 'category', 'limit']),
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('management/ia-tools/create', [
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateToolRequest $request)
    {
        $validated = $request->validated();

        // Decodificar JSON si vienen como strings
        if (is_string($validated['schema'])) {
            $validated['schema'] = json_decode($validated['schema'], true);
        }
        
        if (is_string($validated['config'])) {
            $validated['config'] = json_decode($validated['config'], true);
        }

        // Generar slug único
        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;

        while (Tool::where('company_id', Auth::user()->company_id)
                  ->where('slug', $slug)
                  ->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Crear herramienta
        $tool = Tool::create([
            'company_id' => Auth::user()->company_id,
            'name' => $validated['name'],
            'slug' => $slug,
            'category' => $validated['category'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'schema' => $validated['schema'],
            'config' => $validated['config'],
            'enabled' => $validated['enabled'] ?? true,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('ia-tools.show', $tool)
            ->with('success', 'Herramienta creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tool $tool)
    {
        // Verificar que pertenece a la empresa del usuario
        if ($tool->company_id !== Auth::user()->company_id) {
            abort(404);
        }

        $tool->load([
            'executions' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        return inertia('management/ia-tools/show', [
            'tool' => $tool,
            'executionStats' => $this->getToolExecutionStats($tool),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tool $tool)
    {
        if ($tool->company_id !== Auth::user()->company_id) {
            abort(404);
        }

        return inertia('management/ia-tools/edit', [
            'tool' => $tool,
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateToolRequest $request, Tool $tool)
    {
        if ($tool->company_id !== Auth::user()->company_id) {
            abort(404);
        }

        $validated = $request->validated();

        // Si el nombre cambió, regenerar slug
        if ($validated['name'] !== $tool->name) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;

            while (Tool::where('company_id', Auth::user()->company_id)
                      ->where('slug', $slug)
                      ->where('id', '!=', $tool->id)
                      ->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $validated['slug'] = $slug;
        }

        $validated['updated_by'] = Auth::id();

        $tool->update($validated);

        return redirect()->route('ia-tools.show', $tool)
            ->with('success', 'Herramienta actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tool $tool)
    {
        if ($tool->company_id !== Auth::user()->company_id) {
            abort(404);
        }

        // No permitir eliminar si tiene ejecuciones recientes
        $recentExecutions = $tool->executions()
            ->where('created_at', '>=', now()->subDays(7))
            ->exists();

        if ($recentExecutions) {
            return back()->with('error', 'No se puede eliminar una herramienta con ejecuciones recientes.');
        }

        $toolName = $tool->name;
        $tool->delete();

        return redirect()->route('ia-tools.index')
            ->with('success', "Herramienta '{$toolName}' eliminada exitosamente.");
    }

    /**
     * Toggle tool enabled status
     */
    public function toggleStatus(Tool $tool)
    {
        if ($tool->company_id !== Auth::user()->company_id) {
            abort(404);
        }

        $tool->update([
            'enabled' => !$tool->enabled,
            'updated_by' => Auth::id(),
        ]);

        $status = $tool->enabled ? 'habilitada' : 'deshabilitada';

        return back()->with('success', "Herramienta {$status} exitosamente.");
    }

    /**
     * Test a tool configuration
     */
    public function test(Tool $tool, Request $request)
    {
        if ($tool->company_id !== Auth::user()->company_id) {
            abort(404);
        }

        $request->validate([
            'payload' => 'required|array',
        ]);

        try {
            // Validar payload
            $this->toolValidator->validatePayload($tool, $request->input('payload'));

            // Para herramientas externas, podríamos hacer una llamada de prueba
            if ($tool->type === 'external') {
                // TODO: Implementar test de herramienta externa
                return response()->json([
                    'success' => true,
                    'message' => 'Configuración válida (test real pendiente de implementar)',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Configuración de herramienta válida',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Obtener categorías disponibles
     */
    private function getAvailableCategories(): array
    {
        return [
            'ticket' => 'Tickets',
            'whatsapp' => 'WhatsApp',
            'instagram' => 'Instagram',
            'facebook' => 'Facebook',
            'telegram' => 'Telegram',
            'external' => 'API Externa',
            'crm' => 'CRM',
            'analytics' => 'Analíticas',
            'notification' => 'Notificaciones',
            'other' => 'Otro',
        ];
    }

    /**
     * Obtener estadísticas de ejecución de una herramienta
     */
    private function getToolExecutionStats(Tool $tool): array
    {
        $executions = $tool->executions()
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        return [
            'total_executions' => $executions->count(),
            'successful_executions' => $executions->where('status', 'success')->count(),
            'failed_executions' => $executions->where('status', 'failed')->count(),
            'avg_execution_time' => $this->calculateAverageExecutionTime($executions),
            'last_execution' => $tool->last_executed_at,
            'success_rate' => $executions->isNotEmpty() 
                ? ($executions->where('status', 'success')->count() / $executions->count()) * 100 
                : 0,
        ];
    }

    /**
     * Calcular tiempo promedio de ejecución
     */
    private function calculateAverageExecutionTime($executions): ?float
    {
        $completedExecutions = $executions->whereIn('status', ['success', 'failed']);
        
        if ($completedExecutions->isEmpty()) {
            return null;
        }

        $totalTime = $completedExecutions->sum(function ($execution) {
            return $execution->updated_at->diffInMilliseconds($execution->created_at);
        });

        return $totalTime / $completedExecutions->count();
    }
}
