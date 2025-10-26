<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    /**
     * Listar departamentos con búsqueda, filtros y paginación
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);

        $query = Department::forCompany($user->company_id)
            ->with(['company:id,name', 'agents.user:id,name,email'])
            ->withCount(['agents', 'hours', 'exceptions']);

        // Búsqueda en múltiples campos
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('description', 'like', $searchTerm);
            });
        }

        // Filtro por estado activo/inactivo
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filtro por timezone
        if ($request->has('timezone') && !empty($request->timezone)) {
            $query->where('timezone', $request->timezone);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSorts = ['name', 'created_at', 'updated_at', 'is_active', 'agents_count'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $departments = $query->paginate($perPage);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $departments,
                'meta' => [
                    'total_active' => Department::forCompany($user->company_id)->active()->count(),
                    'total_inactive' => Department::forCompany($user->company_id)->where('is_active', false)->count(),
                    'includes' => ['company', 'agents.user', 'agents_count', 'hours_count', 'exceptions_count']
                ]
            ]);
        }

        return inertia('management/departments/index', [
            'departments' => $departments,
            'filters' => $request->only(['search', 'is_active', 'timezone', 'limit']),
        ]);
    }

    /**
     * Obtener un departamento específico con todas sus relaciones
     */
    public function show(Department $department): JsonResponse
    {
        $user = auth()->user();

        // Verificar que el departamento pertenece a la company del usuario
        if ($department->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes acceso a este departamento',
                'toastType' => 'error'
            ], 403);
        }

        $department->load([
            'company:id,name',
            'agents.user:id,name,email',
            'hours' => function($query) {
                $query->orderBy('day_of_week');
            },
            'exceptions' => function($query) {
                $query->orderBy('start_date', 'desc');
            },
            'scheduleAudits' => function($query) {
                $query->with('changedBy:id,name')->latest()->take(10);
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => $department,
            'meta' => [
                'includes' => ['company', 'agents.user', 'hours', 'exceptions', 'scheduleAudits.changedBy']
            ]
        ]);
    }

    /**
     * Crear un nuevo departamento
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $department = Department::create($request->validated());

            // Crear horarios por defecto si se proporcionan
            if ($request->has('hours') && is_array($request->hours)) {
                $this->syncDepartmentHours($department, $request->hours);
            }

            // Registrar auditoría de creación
            $this->createScheduleAudit($department, 'created', null, $department->toArray());

            DB::commit();

            $department->load(['company:id,name', 'agents.user:id,name,email', 'hours']);

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Departamento creado exitosamente',
                'toastType' => 'success'
            ], 201);

        } catch (QueryException $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el departamento: ' . $e->getMessage(),
                'toastType' => 'error'
            ], 422);
        }
    }

    /**
     * Actualizar un departamento existente
     */
    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        try {
            DB::beginTransaction();

            $previousData = $department->toArray();
            $department->update($request->validated());

            // Actualizar horarios si se proporcionan
            if ($request->has('hours') && is_array($request->hours)) {
                $this->syncDepartmentHours($department, $request->hours);
            }

            // Registrar auditoría de actualización
            $this->createScheduleAudit($department, 'updated', $previousData, $department->fresh()->toArray());

            DB::commit();

            $department->load(['company:id,name', 'agents.user:id,name,email', 'hours']);

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => 'Departamento actualizado exitosamente',
                'toastType' => 'success'
            ]);

        } catch (QueryException $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el departamento: ' . $e->getMessage(),
                'toastType' => 'error'
            ], 422);
        }
    }

    /**
     * Eliminar un departamento
     */
    public function destroy(Department $department): JsonResponse
    {
        $user = auth()->user();

        // Verificar que el departamento pertenece a la company del usuario
        if ($department->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes acceso a este departamento',
                'toastType' => 'error'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Verificar si hay agentes asignados
            $agentsCount = $department->agents()->count();
            if ($agentsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el departamento porque tiene {$agentsCount} agente(s) asignado(s)",
                    'toastType' => 'error'
                ], 422);
            }

            // Registrar auditoría de eliminación
            $this->createScheduleAudit($department, 'deleted', $department->toArray(), null);

            $department->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Departamento eliminado exitosamente',
                'toastType' => 'success'
            ]);

        } catch (QueryException $e) {
            DB::rollback();

            // Error de integridad referencial
            if ($e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el departamento porque tiene registros relacionados',
                    'toastType' => 'error'
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el departamento: ' . $e->getMessage(),
                'toastType' => 'error'
            ], 500);
        }
    }

    /**
     * Activar/Desactivar un departamento
     */
    public function toggleStatus(Department $department): JsonResponse
    {
        $user = auth()->user();

        if ($department->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes acceso a este departamento',
                'toastType' => 'error'
            ], 403);
        }

        try {
            $previousData = $department->toArray();
            $department->update(['is_active' => !$department->is_active]);

            $this->createScheduleAudit($department, 'updated', $previousData, $department->fresh()->toArray());

            $status = $department->is_active ? 'activado' : 'desactivado';

            return response()->json([
                'success' => true,
                'data' => $department,
                'message' => "Departamento {$status} exitosamente",
                'toastType' => 'success'
            ]);

        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado del departamento: ' . $e->getMessage(),
                'toastType' => 'error'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de los departamentos
     */
    public function stats(Request $request): JsonResponse
    {
        $user = auth()->user();

        $stats = [
            'total' => Department::forCompany($user->company_id)->count(),
            'active' => Department::forCompany($user->company_id)->active()->count(),
            'inactive' => Department::forCompany($user->company_id)->where('is_active', false)->count(),
            'with_agents' => Department::forCompany($user->company_id)->has('agents')->count(),
            'without_agents' => Department::forCompany($user->company_id)->doesntHave('agents')->count(),
            'by_timezone' => Department::forCompany($user->company_id)
                ->select('timezone', DB::raw('count(*) as count'))
                ->groupBy('timezone')
                ->get()
                ->keyBy('timezone')
                ->map(fn($item) => $item->count)
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Método privado para sincronizar horarios del departamento
     */
    private function syncDepartmentHours(Department $department, array $hours): void
    {
        // Eliminar horarios existentes
        $department->hours()->delete();

        // Crear nuevos horarios
        foreach ($hours as $hour) {
            $department->hours()->create([
                'day_of_week' => $hour['day_of_week'],
                'open_time' => $hour['open_time'] ?? null,
                'close_time' => $hour['close_time'] ?? null,
                'is_closed' => $hour['is_closed'] ?? false,
            ]);
        }
    }

    /**
     * Método privado para crear auditoría de cambios
     */
    private function createScheduleAudit(Department $department, string $changeType, ?array $previousData, ?array $newData): void
    {
        $department->scheduleAudits()->create([
            'change_type' => $changeType,
            'previous_data' => $previousData,
            'new_data' => $newData,
            'changed_by' => auth()->id(),
        ]);
    }
}
