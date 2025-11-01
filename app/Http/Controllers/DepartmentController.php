<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class DepartmentController extends Controller
{
    /**
     * List departments with search, filters and pagination
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('limit', 10);
        $status = $request->get('status', null);

        $query = Department::forCompany($user->company_id)
            ->with(['company:id,name', 'agents.user:id,name,email'])
            ->withCount(['agents', 'hours', 'exceptions']);

        Log::info("search term: " . $request->search);
        Log::info($query->toSql(), $query->getBindings());

        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm);
            });
        }

        if ($request->has('status') && $status !== null && $status !== 'all') {
            $query->where('is_active', boolval($status === "true"));
        }

        if ($request->has('timezone') && !empty($request->timezone)) {
            $query->where('timezone', $request->timezone);
        }

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
                'filters' => $request->only(['search', 'status', 'limit', 'timezone', 'sort_by', 'sort_direction'])
            ]);
        }

        return inertia('management/departments/index', [
            'departments' => $departments,
            'filters' => $request->only(['search', 'status', 'limit']),
        ]);
    }

    /**
     * Get a specific department with all relations
     */
    public function show(Request $request, Department $department)
    {
        $user = auth()->user();

        if ($department->company_id !== $user->company_id) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this department',
                    'toastType' => 'error'
                ], 403);
            }
            return back()->withErrors(['error' => 'You do not have access to this department']);
        }

        $department->load([
            'company:id,name',
            'agents.user:id,name,email',
            'hours' => function($query) {
                $query->orderBy('day_of_week')->orderBy('open_time');
            },
            'exceptions' => function($query) {
                $query->orderBy('start_date', 'desc');
            },
            'scheduleAudits' => function($query) {
                $query->with('changedBy:id,name')->latest()->take(10);
            }
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $department,
            ]);
        }

        return inertia('management/departments/department', [
            'department' => $department,
        ]);
    }

    /**
     * Create a new department
     */
    public function store(StoreDepartmentRequest $request)
    {
        try {
            DB::beginTransaction();

            $department = Department::create($request->validated());

            if ($request->has('hours') && is_array($request->hours)) {
                $this->syncDepartmentHours($department, $request->hours);
            }

            $this->createScheduleAudit($department, 'created', null, $department->toArray());

            DB::commit();

            $department->load(['company:id,name', 'agents.user:id,name,email', 'hours']);

            if($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $department,
                    'message' => 'Department created successfully',
                    'toastType' => 'success'
                ], 201);
            }
            return back()->with('success', 'Department created successfully');

        } catch (QueryException $e) {
            DB::rollback();

            Log::error('Error creating department: ' . $e->getMessage());

            if($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error creating department: ' . $e->getMessage(),
                    'toastType' => 'error'
                ], 422);
            }
            return back()->withErrors(['error' => 'Error creating department: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Update an existing department
     */
    public function update(UpdateDepartmentRequest $request, Department $department)
    {
        try {
            DB::beginTransaction();

            $previousData = $department->toArray();
            $department->update($request->validated());

            if ($request->has('hours') && is_array($request->hours)) {
                $this->syncDepartmentHours($department, $request->hours);
            }

            $this->createScheduleAudit($department, 'updated', $previousData, $department->fresh()->toArray());

            DB::commit();

            $department->load(['company:id,name', 'agents.user:id,name,email', 'hours']);

            if($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $department,
                    'message' => 'Department updated successfully',
                    'toastType' => 'success'
                ]);
            } else {
                return back()->with('success', 'Department updated successfully');
            }

        } catch (QueryException $e) {
            DB::rollback();

            if($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error updating department: ' . $e->getMessage(),
                    'toastType' => 'error'
                ], 422);
            } else {
                return back()->withErrors(['error' => 'Error updating department: ' . $e->getMessage()])->withInput();
            }
        }
    }

    /**
     * Delete a department
     */
    public function destroy(Request $request, Department $department)
    {
        $user = auth()->user();

        if ($department->company_id !== $user->company_id) {
            if($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this department',
                    'toastType' => 'error'
                ], 403);
            } else {
                return back()->withErrors(['error' => 'You do not have access to this department']);
            }
        }

        try {
            DB::beginTransaction();

            $agentsCount = $department->agents()->count();
            if ($agentsCount > 0) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => "Cannot delete department because it has {$agentsCount} assigned agent(s)",
                        'toastType' => 'error'
                    ], 422);
                } else {
                    return back()->withErrors(['error' => "Cannot delete department because it has {$agentsCount} assigned agent(s)"]);
                }
            }

            $this->createScheduleAudit($department, 'deleted', $department->toArray(), null);

            $department->delete();

            DB::commit();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Department deleted successfully',
                    'toastType' => 'success'
                ]);
            } else {
                return back()->with('success', 'Department deleted successfully');
            }

        } catch (QueryException $e) {
            DB::rollback();

            if ($e->getCode() === '23000') {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete department because it has related records',
                        'toastType' => 'error'
                    ], 422);
                } else {
                    return back()->withErrors(['error' => 'Cannot delete department because it has related records']);
                }
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error deleting department: ' . $e->getMessage(),
                    'toastType' => 'error'
                ], 500);
            } else {
                return back()->withErrors(['error' => 'Error deleting department: ' . $e->getMessage()]);
            }
        }
    }

    /**
     * Toggle department active/inactive
     */
    public function toggleStatus(Request $request, Department $department)
    {
        $user = auth()->user();

        if ($department->company_id !== $user->company_id) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this department',
                    'toastType' => 'error'
                ], 403);
            } else {
                return back()->withErrors(['error' => 'You do not have access to this department']);
            }
        }

        try {
            $previousData = $department->toArray();
            $department->update(['is_active' => !$department->is_active]);

            $this->createScheduleAudit($department, 'updated', $previousData, $department->fresh()->toArray());

            $status = $department->is_active ? 'activated' : 'deactivated';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $department,
                    'message' => "Department {$status} successfully",
                    'toastType' => 'success'
                ]);
            } else {
                return back()->with('success', "Department {$status} successfully");
            }

        } catch (QueryException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error changing department status: ' . $e->getMessage(),
                    'toastType' => 'error'
                ], 500);
            } else {
                return back()->withErrors(['error' => 'Error changing department status: ' . $e->getMessage()]);
            }
        }
    }

    /**
     * Get departments statistics
     */
    public function stats(Request $request)
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

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        }

        return inertia('management/departments/stats', [
            'stats' => $stats
        ]);
    }

    /**
     * Sync department hours
     */
    private function syncDepartmentHours(Department $department, array $hours): void
    {
        $department->hours()->delete();

        foreach ($hours as $daySchedule) {
            $dayOfWeek = $daySchedule['day_of_week'];
            $isClosed = $daySchedule['is_closed'] ?? false;

            if (isset($daySchedule['time_ranges']) && is_array($daySchedule['time_ranges'])) {
                // Si hay múltiples rangos de tiempo, crear uno por cada rango
                foreach ($daySchedule['time_ranges'] as $timeRange) {
                    $department->hours()->create([
                        'day_of_week' => $dayOfWeek,
                        'open_time' => $timeRange['open_time'] ?? null,
                        'close_time' => $timeRange['close_time'] ?? null,
                        'is_closed' => $isClosed
                    ]);
                }
            } else {
                // Formato legacy - compatibilidad con formato anterior
                $department->hours()->create([
                    'day_of_week' => $dayOfWeek,
                    'open_time' => $daySchedule['open_time'] ?? null,
                    'close_time' => $daySchedule['close_time'] ?? null,
                    'is_closed' => $isClosed,
                ]);
            }
        }
    }

    /**
     * Create schedule audit
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
