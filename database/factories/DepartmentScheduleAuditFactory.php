<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DepartmentScheduleAudit>
 */
class DepartmentScheduleAuditFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $changeType = $this->faker->randomElement([
            'department_created',
            'department_updated',
            'department_deleted',
            'hours_updated',
            'exception_created',
            'exception_updated',
            'exception_deleted',
            'schedule_override',
        ]);

        // Datos de ejemplo según el tipo de cambio
        $changeData = $this->generateChangeData($changeType);

        return [
            'department_id' => \App\Models\Department::factory(),
            'change_type' => $changeType,
            'previous_data' => $changeData['previous'],
            'new_data' => $changeData['current'],
            'changed_by' => \App\Models\User::factory(),
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }

    /**
     * Generate realistic change data based on change type
     */
    private function generateChangeData(string $changeType): array
    {
        return match ($changeType) {
            'department_created' => $this->departmentCreatedData(),
            'department_updated' => $this->departmentUpdatedData(),
            'department_deleted' => $this->departmentDeletedData(),
            'hours_updated' => $this->hoursUpdatedData(),
            'exception_created' => $this->exceptionCreatedData(),
            'exception_updated' => $this->exceptionUpdatedData(),
            'exception_deleted' => $this->exceptionDeletedData(),
            'schedule_override' => $this->scheduleOverrideData(),
            default => ['previous' => null, 'current' => null]
        };
    }

    /**
     * Data for department creation
     */
    private function departmentCreatedData(): array
    {
        $departmentData = [
            'name' => $this->faker->company().' Department',
            'description' => $this->faker->optional(0.7)->sentence(),
            'timezone' => $this->faker->timezone(),
            'is_active' => true,
            'company_id' => 1,
        ];

        return [
            'previous' => null,
            'current' => $departmentData,
        ];
    }

    /**
     * Data for department updates
     */
    private function departmentUpdatedData(): array
    {
        $oldData = [
            'name' => 'Old Department Name',
            'description' => 'Old department description',
            'timezone' => 'America/New_York',
            'is_active' => true,
        ];

        $newData = [
            'name' => 'Updated Department Name',
            'description' => 'Updated department description',
            'timezone' => 'America/Los_Angeles',
            'is_active' => false,
            'updated_fields' => ['name', 'description', 'timezone', 'is_active'],
        ];

        return [
            'previous' => $oldData,
            'current' => $newData,
        ];
    }

    /**
     * Data for department deletion
     */
    private function departmentDeletedData(): array
    {
        $departmentData = [
            'name' => 'Deleted Department',
            'description' => 'This department was deleted',
            'timezone' => 'UTC',
            'is_active' => true,
            'deleted_at' => now()->toISOString(),
        ];

        return [
            'previous' => $departmentData,
            'current' => null,
        ];
    }

    /**
     * Data for hours updates
     */
    private function hoursUpdatedData(): array
    {
        $oldHours = [
            'monday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
            'tuesday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
            'wednesday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
            'thursday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
            'friday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
            'saturday' => ['open' => null, 'close' => null, 'closed' => true],
            'sunday' => ['open' => null, 'close' => null, 'closed' => true],
        ];

        $newHours = [
            'monday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
            'tuesday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
            'wednesday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
            'thursday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
            'friday' => ['open' => '08:00', 'close' => '17:00', 'closed' => false],
            'saturday' => ['open' => '10:00', 'close' => '14:00', 'closed' => false],
            'sunday' => ['open' => null, 'close' => null, 'closed' => true],
            'updated_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        ];

        return [
            'previous' => ['hours' => $oldHours],
            'current' => ['hours' => $newHours],
        ];
    }

    /**
     * Data for exception creation
     */
    private function exceptionCreatedData(): array
    {
        $exceptionData = [
            'name' => $this->faker->randomElement([
                'Holiday Closure',
                'Maintenance Day',
                'Team Building',
                'System Update',
                'Company Event',
            ]),
            'type' => $this->faker->randomElement(['annual', 'monthly', 'specific']),
            'start_date' => $this->faker->dateTimeBetween('+1 week', '+3 months')->format('Y-m-d'),
            'behavior' => $this->faker->randomElement(['fully_closed', 'partially_closed', 'partially_open']),
            'recurrence_pattern' => $this->generateRecurrencePattern(),
        ];

        // Add time data based on behavior
        if ($exceptionData['behavior'] === 'partially_closed') {
            $exceptionData['special_open_time'] = '10:00:00';
            $exceptionData['special_close_time'] = '14:00:00';
        } elseif ($exceptionData['behavior'] === 'partially_open') {
            $exceptionData['partial_hours'] = [
                ['open_time' => '09:00:00', 'close_time' => '12:00:00'],
                ['open_time' => '14:00:00', 'close_time' => '16:00:00'],
            ];
        }

        return [
            'previous' => null,
            'current' => $exceptionData,
        ];
    }

    /**
     * Data for exception updates
     */
    private function exceptionUpdatedData(): array
    {
        $oldException = [
            'name' => 'Old Exception Name',
            'type' => 'specific',
            'start_date' => '2024-01-15',
            'behavior' => 'fully_closed',
            'recurrence_pattern' => null,
        ];

        $newException = [
            'name' => 'Updated Exception Name',
            'type' => 'annual',
            'start_date' => '2024-01-15',
            'behavior' => 'partially_closed',
            'recurrence_pattern' => ['month' => 1, 'day' => 15],
            'special_open_time' => '11:00:00',
            'special_close_time' => '15:00:00',
            'updated_fields' => ['name', 'type', 'behavior', 'recurrence_pattern', 'special_open_time', 'special_close_time'],
        ];

        return [
            'previous' => $oldException,
            'current' => $newException,
        ];
    }

    /**
     * Data for exception deletion
     */
    private function exceptionDeletedData(): array
    {
        $exceptionData = [
            'name' => 'Deleted Exception',
            'type' => 'specific',
            'start_date' => '2024-02-01',
            'behavior' => 'fully_closed',
            'deleted_at' => now()->toISOString(),
        ];

        return [
            'previous' => $exceptionData,
            'current' => null,
        ];
    }

    /**
     * Data for schedule overrides (manual changes)
     */
    private function scheduleOverrideData(): array
    {
        $overrideData = [
            'date' => $this->faker->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
            'reason' => $this->faker->sentence(),
            'original_schedule' => [
                'open_time' => '09:00:00',
                'close_time' => '18:00:00',
                'is_closed' => false,
            ],
            'override_schedule' => [
                'open_time' => '10:00:00',
                'close_time' => '15:00:00',
                'is_closed' => false,
            ],
            'override_type' => 'manual_adjustment',
        ];

        return [
            'previous' => $overrideData['original_schedule'],
            'current' => $overrideData,
        ];
    }

    /**
     * Generate recurrence pattern for exceptions
     */
    private function generateRecurrencePattern(): array
    {
        $type = $this->faker->randomElement(['annual', 'monthly', 'specific']);

        return match ($type) {
            'annual' => [
                'month' => $this->faker->numberBetween(1, 12),
                'day' => $this->faker->numberBetween(1, 28),
            ],
            'monthly' => $this->faker->randomElement([
                [
                    'type' => 'specific_day',
                    'day_of_month' => $this->faker->numberBetween(1, 28),
                ],
                [
                    'type' => 'pattern',
                    'week_pattern' => $this->faker->randomElement(['first', 'second', 'third', 'fourth', 'last']),
                    'day_of_week' => $this->faker->numberBetween(0, 6),
                ],
            ]),
            'specific' => null
        };
    }

    /**
     * Indicate a specific change type
     */
    public function changeType(string $changeType): static
    {
        return $this->state(fn (array $attributes) => [
            'change_type' => $changeType,
        ]);
    }

    /**
     * Indicate a department creation audit
     */
    public function departmentCreated(): static
    {
        return $this->changeType('department_created');
    }

    /**
     * Indicate a department update audit
     */
    public function departmentUpdated(): static
    {
        return $this->changeType('department_updated');
    }

    /**
     * Indicate a hours update audit
     */
    public function hoursUpdated(): static
    {
        return $this->changeType('hours_updated');
    }

    /**
     * Indicate an exception creation audit
     */
    public function exceptionCreated(): static
    {
        return $this->changeType('exception_created');
    }

    /**
     * Indicate an exception update audit
     */
    public function exceptionUpdated(): static
    {
        return $this->changeType('exception_updated');
    }

    /**
     * Indicate a schedule override audit
     */
    public function scheduleOverride(): static
    {
        return $this->changeType('schedule_override');
    }

    /**
     * Indicate a specific department
     */
    public function forDepartment(\App\Models\Department $department): static
    {
        return $this->state(fn (array $attributes) => [
            'department_id' => $department->id,
        ]);
    }

    /**
     * Indicate a specific user who made the change
     */
    public function changedBy(\App\Models\User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'changed_by' => $user->id,
        ]);
    }

    /**
     * Indicate a recent change
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate an old change
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-6 months', '-1 month'),
        ]);
    }
}
