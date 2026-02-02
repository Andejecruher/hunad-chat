<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DepartmentException>
 */
class DepartmentExceptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['annual', 'monthly', 'specific']);
        $behavior = $this->faker->randomElement(['fully_closed', 'partially_closed', 'partially_open']);

        $baseData = [
            'department_id' => \App\Models\Department::factory(),
            'name' => $this->faker->sentence(3),
            'type' => $type,
            'behavior' => $behavior,
        ];

        // Configurar según el tipo
        switch ($type) {
            case 'annual':
                $baseData['start_date'] = $this->faker->date();
                $baseData['recurrence_pattern'] = [
                    'month' => $this->faker->numberBetween(1, 12),
                    'day' => $this->faker->numberBetween(1, 28),
                ];
                break;

            case 'monthly':
                $baseData['start_date'] = $this->faker->date();
                if ($this->faker->boolean(60)) {
                    // Día específico del mes
                    $baseData['recurrence_pattern'] = [
                        'type' => 'specific_day',
                        'day_of_month' => $this->faker->numberBetween(1, 28),
                    ];
                } else {
                    // Patrón recurrente
                    $baseData['recurrence_pattern'] = [
                        'type' => 'pattern',
                        'week_pattern' => $this->faker->randomElement(['first', 'second', 'third', 'fourth', 'last']),
                        'day_of_week' => $this->faker->numberBetween(0, 6),
                    ];
                }
                break;

            case 'specific':
                $baseData['start_date'] = $this->faker->dateTimeBetween('+1 week', '+1 year')->format('Y-m-d');
                $baseData['end_date'] = $this->faker->optional(0.3)->dateTimeBetween('+2 days', '+5 days')->format('Y-m-d');
                break;
        }

        // Configurar según el comportamiento
        switch ($behavior) {
            case 'partially_closed':
                $baseData['special_open_time'] = $this->faker->randomElement(['10:00:00', '11:00:00']);
                $baseData['special_close_time'] = $this->faker->randomElement(['14:00:00', '15:00:00']);
                break;

            case 'partially_open':
                $baseData['partial_hours'] = [
                    ['open_time' => '09:00:00', 'close_time' => '12:00:00'],
                    ['open_time' => '14:00:00', 'close_time' => '17:00:00'],
                ];
                break;
        }

        return $baseData;
    }

    /**
     * Indicate an annual exception.
     */
    public function annual(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'annual',
            'start_date' => $this->faker->date(),
            'recurrence_pattern' => [
                'month' => $this->faker->numberBetween(1, 12),
                'day' => $this->faker->numberBetween(1, 28),
            ],
        ]);
    }

    /**
     * Indicate a monthly exception with specific day.
     */
    public function monthlySpecificDay(int $dayOfMonth): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'monthly',
            'start_date' => $this->faker->date(),
            'recurrence_pattern' => [
                'type' => 'specific_day',
                'day_of_month' => $dayOfMonth,
            ],
        ]);
    }

    /**
     * Indicate a fully closed exception.
     */
    public function fullyClosed(): static
    {
        return $this->state(fn (array $attributes) => [
            'behavior' => 'fully_closed',
            'special_open_time' => null,
            'special_close_time' => null,
            'partial_hours' => null,
        ]);
    }

    /**
     * Indicate a partially closed exception.
     */
    public function partiallyClosed(): static
    {
        return $this->state(fn (array $attributes) => [
            'behavior' => 'partially_closed',
            'special_open_time' => $this->faker->randomElement(['10:00:00', '11:00:00']),
            'special_close_time' => $this->faker->randomElement(['14:00:00', '15:00:00']),
            'partial_hours' => null,
        ]);
    }

    /**
     * Indicate a partially open exception.
     */
    public function partiallyOpen(): static
    {
        return $this->state(fn (array $attributes) => [
            'behavior' => 'partially_open',
            'special_open_time' => null,
            'special_close_time' => null,
            'partial_hours' => [
                ['open_time' => '09:00:00', 'close_time' => '12:00:00'],
                ['open_time' => '14:00:00', 'close_time' => '17:00:00'],
            ],
        ]);
    }
}
