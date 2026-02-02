<?php

namespace App\Http\Controllers;

use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
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

        Log::info('search term: '.$request->search);
        Log::info($query->toSql(), $query->getBindings());

        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = '%'.$request->search.'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm);
            });
        }

        if ($request->has('status') && $status !== null && $status !== 'all') {
            $query->where('is_active', boolval($status === 'true'));
        }

        if ($request->has('timezone') && ! empty($request->timezone)) {
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
                'filters' => $request->only(['search', 'status', 'limit', 'timezone', 'sort_by', 'sort_direction']),
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
                    'toastType' => 'error',
                ], 403);
            }

            return back()->withErrors(['error' => 'You do not have access to this department']);
        }

        $department->load([
            'company:id,name',
            'agents.user:id,name,email',
            'hours' => fn ($query) => $query->orderBy('day_of_week')->orderBy('open_time'),
            'exceptions' => fn ($query) => $query->orderBy('start_date', 'desc'),
            'scheduleAudits' => fn ($query) => $query->with('changedBy:id,name')->latest()->take(10),
        ]);

        // --- Transform hours ---
        $hoursGrouped = $department->hours
            ->groupBy('day_of_week')
            ->map(fn ($dayHours, $day) => [
                'day_of_week' => (int) $day,
                'time_ranges' => $dayHours->map(fn ($h) => [
                    'id' => $h->id,
                    'open_time' => $h->open_time,
                    'close_time' => $h->close_time,
                ])->values(),
                'is_closed' => $dayHours->isEmpty() || $dayHours->first()->is_closed ?? false,
            ])
            ->values();

        $completeHours = collect(range(0, 6))->map(fn ($day) => $hoursGrouped->firstWhere('day_of_week', $day) ?? [
            'day_of_week' => $day,
            'time_ranges' => [],
            'is_closed' => true,
        ]
        );

        // --- Convert model to array and inject formatted hours ---
        $departmentData = $department->toArray();
        $departmentData['hours'] = $completeHours;

        // --- Return properly formatted data ---
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $departmentData,
            ]);
        }

        return inertia('management/departments/department', [
            'department' => $departmentData,
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

            if ($request->has('exceptions') && is_array($request->exceptions)) {
                $this->syncDepartmentExceptions($department, $request->exceptions);
            }

            $this->createScheduleAudit($department, 'created', null, $department->toArray());

            DB::commit();

            $department->load(['company:id,name', 'agents.user:id,name,email', 'hours', 'exceptions']);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $department,
                    'message' => 'Department created successfully',
                    'toastType' => 'success',
                ], 201);
            }

            return back()->with('success', 'Department created successfully');

        } catch (QueryException $e) {
            DB::rollback();

            Log::error('Error creating department: '.$e->getMessage());

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error creating department: '.$e->getMessage(),
                    'toastType' => 'error',
                ], 422);
            }

            return back()->withErrors(['error' => 'Error creating department: '.$e->getMessage()])->withInput();
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

            if ($request->has('exceptions') && is_array($request->exceptions)) {
                $this->syncDepartmentExceptions($department, $request->exceptions);
            }

            $this->createScheduleAudit($department, 'updated', $previousData, $department->fresh()->toArray());

            DB::commit();

            $department->load(['company:id,name', 'agents.user:id,name,email', 'hours', 'exceptions']);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $department,
                    'message' => 'Department updated successfully',
                    'toastType' => 'success',
                ]);
            } else {
                return back()->with('success', 'Department updated successfully');
            }

        } catch (QueryException $e) {
            DB::rollback();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error updating department: '.$e->getMessage(),
                    'toastType' => 'error',
                ], 422);
            } else {
                return back()->withErrors(['error' => 'Error updating department: '.$e->getMessage()])->withInput();
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
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this department',
                    'toastType' => 'error',
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
                        'toastType' => 'error',
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
                    'toastType' => 'success',
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
                        'toastType' => 'error',
                    ], 422);
                } else {
                    return back()->withErrors(['error' => 'Cannot delete department because it has related records']);
                }
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error deleting department: '.$e->getMessage(),
                    'toastType' => 'error',
                ], 500);
            } else {
                return back()->withErrors(['error' => 'Error deleting department: '.$e->getMessage()]);
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
                    'toastType' => 'error',
                ], 403);
            } else {
                return back()->withErrors(['error' => 'You do not have access to this department']);
            }
        }

        try {
            $previousData = $department->toArray();
            $department->update(['is_active' => ! $department->is_active]);

            $this->createScheduleAudit($department, 'updated', $previousData, $department->fresh()->toArray());

            $status = $department->is_active ? 'activated' : 'deactivated';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $department,
                    'message' => "Department {$status} successfully",
                    'toastType' => 'success',
                ]);
            } else {
                return back()->with('success', "Department {$status} successfully");
            }

        } catch (QueryException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error changing department status: '.$e->getMessage(),
                    'toastType' => 'error',
                ], 500);
            } else {
                return back()->withErrors(['error' => 'Error changing department status: '.$e->getMessage()]);
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
                ->map(fn ($item) => $item->count),
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        }

        return inertia('management/departments/stats', [
            'stats' => $stats,
        ]);
    }

    /**
     * Sync department hours
     */
    protected function syncDepartmentHours(Department $department, array $hours): void
    {
        foreach ($hours as $daySchedule) {
            $dayOfWeek = $daySchedule['day_of_week'];
            $isClosed = $daySchedule['is_closed'] ?? false;
            $timeRanges = $daySchedule['time_ranges'] ?? [];

            // Fetch existing ranges for this day
            $existingRanges = $department->hours()
                ->where('day_of_week', $dayOfWeek)
                ->get()
                ->keyBy('id');

            $processedIds = [];

            // If the day is closed and there are no ranges, create/update a closed record
            if ($isClosed && empty($timeRanges)) {
                // First delete all existing ranges for this day
                $department->hours()->where('day_of_week', $dayOfWeek)->delete();

                // Create a record that indicates the day is closed
                $department->hours()->create([
                    'day_of_week' => $dayOfWeek,
                    'open_time' => null,
                    'close_time' => null,
                    'is_closed' => true,
                ]);

                continue; // Move to the next day
            }

            // If there are time ranges to process
            if (! empty($timeRanges)) {
                foreach ($timeRanges as $range) {
                    // Validate the range has the required data
                    if (empty($range['open_time']) || empty($range['close_time'])) {
                        continue;
                    }

                    // Normalize time format by adding seconds if missing
                    $openTime = $this->normalizeTime($range['open_time']);
                    $closeTime = $this->normalizeTime($range['close_time']);

                    if (isset($range['id']) && $range['id'] && $existingRanges->has($range['id'])) {
                        // Update existing range
                        $existing = $existingRanges[$range['id']];
                        $existing->update([
                            'open_time' => $openTime,
                            'close_time' => $closeTime,
                            'is_closed' => false, // Si hay horarios, no está cerrado
                        ]);
                        $processedIds[] = $existing->id;
                    } else {
                        // Create new range
                        $new = $department->hours()->create([
                            'day_of_week' => $dayOfWeek,
                            'open_time' => $openTime,
                            'close_time' => $closeTime,
                            'is_closed' => false, // Si hay horarios, no está cerrado
                        ]);
                        $processedIds[] = $new->id;
                    }
                }
            }

            // Delete ranges not present in the request for this specific day
            $toDelete = $existingRanges->whereNotIn('id', $processedIds);
            if ($toDelete->isNotEmpty()) {
                $department->hours()->whereIn('id', $toDelete->pluck('id'))->delete();
            }

            // If no ranges and the day isn't marked closed, delete existing records
            if (empty($timeRanges) && ! $isClosed) {
                $department->hours()->where('day_of_week', $dayOfWeek)->delete();
            }
        }
    }

    /**
     * Sync department exceptions
     */
    protected function syncDepartmentExceptions(Department $department, array $exceptions): void
    {
        // Get existing exceptions
        $existingExceptions = $department->exceptions()->get()->keyBy('id');
        $processedIds = [];

        foreach ($exceptions as $exceptionData) {
            $exceptionId = $exceptionData['id'] ?? null;

            // Preparar datos de la excepción
            $data = [
                'department_id' => $department->id,
                'name' => $exceptionData['name'],
                'type' => $exceptionData['type'],
                'start_date' => $exceptionData['start_date'],
                'end_date' => $exceptionData['end_date'] ?? null,
                'behavior' => $exceptionData['behavior'],
                'special_open_time' => isset($exceptionData['special_open_time'])
                    ? $this->normalizeTime($exceptionData['special_open_time'])
                    : null,
                'special_close_time' => isset($exceptionData['special_close_time'])
                    ? $this->normalizeTime($exceptionData['special_close_time'])
                    : null,
                'recurrence_pattern' => $exceptionData['recurrence_pattern'] ?? null,
                'partial_hours' => $exceptionData['partial_hours'] ?? null,
            ];

            // If it has an ID, update existing exception
            if ($exceptionId && $existingExceptions->has($exceptionId)) {
                $existingExceptions[$exceptionId]->update($data);
                $processedIds[] = $exceptionId;
            } else {
                // Create new exception
                $newException = $department->exceptions()->create($data);
                $processedIds[] = $newException->id;
            }
        }

        // Delete exceptions not present in the request
        $toDelete = $existingExceptions->whereNotIn('id', $processedIds);
        if ($toDelete->isNotEmpty()) {
            $department->exceptions()->whereIn('id', $toDelete->keys())->delete();
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

    /**
     * Normalize time format to ensure it includes seconds (HH:MM:SS)
     */
    private function normalizeTime(string $time): string
    {
        // If it already has HH:MM:SS format, leave it as is
        if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $time)) {
            return $time;
        }

        // If it has HH:MM format, append :00
        if (preg_match('/^\d{2}:\d{2}$/', $time)) {
            return $time.':00';
        }

        // If format differs, attempt to parse and return standardized format
        try {
            $dateTime = \DateTime::createFromFormat('H:i', $time);
            if ($dateTime !== false) {
                return $dateTime->format('H:i:s');
            }
        } catch (\Exception $e) {
            // If parsing fails, return original time
        }

        return $time;
    }
}
