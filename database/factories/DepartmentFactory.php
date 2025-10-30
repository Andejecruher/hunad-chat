<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\DepartmentException;
use App\Models\Department;
use App\Models\User;
use App\Models\DepartmentHour;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => $this->faker->randomElement([
                'Ventas',
                'Soporte Técnico',
                'Atención al Cliente',
                'Recursos Humanos',
                'Contabilidad',
                'Marketing',
                'TI',
                'Operaciones',
                'Logística',
                'Calidad'
            ]),
            'color' => $this->faker->randomElement([
                'bg-brand-green',
                'bg-brand-blue',
                'bg-brand-red',
                'bg-brand-yellow',
                'bg-brand-purple',
                'bg-brand-orange'
            ]),
            'description' => $this->faker->paragraph(3),
            'timezone' => $this->faker->randomElement([
                'America/Mexico_City',
                'America/New_York',
                'America/Los_Angeles',
                'America/Chicago',
                'Europe/Madrid',
                'UTC'
            ]),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function timezone(string $timezone): static
    {
        return $this->state(fn (array $attributes) => [
            'timezone' => $timezone,
        ]);
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Department $department) {
            $this->createDefaultHours($department);

            if ($this->faker->boolean(30)) {
                $this->createSampleExceptions($department);
            }
        });
    }

    private function createDefaultHours(Department $department): void
    {
        $hours = [];

        for ($day = 1; $day <= 5; $day++) {
            $hours[] = [
                'department_id' => $department->id,
                'day_of_week' => $day,
                'open_time' => '09:00:00',
                'close_time' => '18:00:00',
                'is_closed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $hours[] = [
            'department_id' => $department->id,
            'day_of_week' => 6,
            'open_time' => '10:00:00',
            'close_time' => '14:00:00',
            'is_closed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $hours[] = [
            'department_id' => $department->id,
            'day_of_week' => 0,
            'open_time' => null,
            'close_time' => null,
            'is_closed' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DepartmentHour::insert($hours);
    }

    private function createSampleExceptions(Department $department): void
    {
        $currentYear = now()->year;
        $exceptions = [];

        $annualExceptions = [
            [
                'name' => 'Año Nuevo',
                'type' => 'annual',
                'behavior' => 'fully_closed',
                'recurrence_pattern' => ['month' => 1, 'day' => 1],
            ],
            [
                'name' => 'Día del Trabajo',
                'type' => 'annual',
                'behavior' => 'fully_closed',
                'recurrence_pattern' => ['month' => 5, 'day' => 1],
            ],
            [
                'name' => 'Navidad',
                'type' => 'annual',
                'behavior' => 'fully_closed',
                'recurrence_pattern' => ['month' => 12, 'day' => 25],
            ],
        ];

        // Base con todas las columnas en orden consistente
        $baseRow = [
            'department_id' => $department->id,
            'name' => null,
            'type' => null,
            'start_date' => null,
            'recurrence_pattern' => null,
            'behavior' => null,
            'special_open_time' => null,
            'special_close_time' => null,
            'partial_hours' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        foreach ($annualExceptions as $exception) {
            if ($this->faker->boolean(70)) {
                $month = (int)$exception['recurrence_pattern']['month'];
                $day = (int)$exception['recurrence_pattern']['day'];
                $startDate = sprintf('%04d-%02d-%02d', $currentYear, $month, $day);

                $row = [
                    'name' => $exception['name'],
                    'type' => $exception['type'],
                    'start_date' => $startDate,
                    'recurrence_pattern' => json_encode($exception['recurrence_pattern']),
                    'behavior' => $exception['behavior'],
                ];

                $exceptions[] = array_replace($baseRow, $row);
            }
        }

        if ($this->faker->boolean(40)) {
            $dayOfMonth = $this->faker->numberBetween(1, 28);
            $startDate = sprintf('%04d-%02d-%02d', $currentYear, 1, $dayOfMonth);

            $monthlyRecurrence = [
                'type' => 'specific_day',
                'day_of_month' => $dayOfMonth,
            ];

            $row = [
                'name' => 'Reunión mensual de equipo',
                'type' => 'monthly',
                'start_date' => $startDate,
                'recurrence_pattern' => json_encode($monthlyRecurrence),
                'behavior' => $this->faker->randomElement(['partially_closed', 'fully_closed']),
                'special_open_time' => $this->faker->randomElement([null, '10:00:00']),
                'special_close_time' => $this->faker->randomElement([null, '14:00:00']),
            ];

            $exceptions[] = array_replace($baseRow, $row);
        }

        if ($this->faker->boolean(50)) {
            $specificDate = now()->addDays($this->faker->numberBetween(10, 60))->format('Y-m-d');
            $behavior = $this->faker->randomElement(['fully_closed', 'partially_closed', 'partially_open']);

            $row = [
                'name' => $this->faker->randomElement([
                    'Mantenimiento programado',
                    'Capacitación interna',
                    'Evento corporativo',
                    'Feriado local'
                ]),
                'type' => 'specific',
                'start_date' => $specificDate,
                'behavior' => $behavior,
            ];

            if ($behavior === 'partially_closed') {
                $row['special_open_time'] = '10:00:00';
                $row['special_close_time'] = '14:00:00';
            } elseif ($behavior === 'partially_open') {
                $row['partial_hours'] = json_encode([
                    ['open_time' => '09:00:00', 'close_time' => '12:00:00'],
                    ['open_time' => '14:00:00', 'close_time' => '16:00:00'],
                ]);
            }

            $exceptions[] = array_replace($baseRow, $row);
        }

        if (!empty($exceptions)) {
            DepartmentException::insert($exceptions);
        }
    }
}
