<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DepartmentHour>
 */
class DepartmentHourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isClosed = $this->faker->boolean(20); // 20% de probabilidad de estar cerrado

        return [
            'department_id' => \App\Models\Department::factory(),
            'day_of_week' => $this->faker->numberBetween(0, 6),
            'open_time' => $isClosed ? null : $this->faker->randomElement(['08:00:00', '09:00:00', '10:00:00']),
            'close_time' => $isClosed ? null : $this->faker->randomElement(['17:00:00', '18:00:00', '19:00:00']),
            'is_closed' => $isClosed,
        ];
    }

    /**
     * Indicate that the day is open.
     */
    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_closed' => false,
            'open_time' => $this->faker->randomElement(['08:00:00', '09:00:00', '10:00:00']),
            'close_time' => $this->faker->randomElement(['17:00:00', '18:00:00', '19:00:00']),
        ]);
    }

    /**
     * Indicate that the day is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_closed' => true,
            'open_time' => null,
            'close_time' => null,
        ]);
    }

    /**
     * Indicate a specific day of week.
     */
    public function dayOfWeek(int $day): static
    {
        return $this->state(fn (array $attributes) => [
            'day_of_week' => $day,
        ]);
    }

    /**
     * Indicate specific hours.
     */
    public function hours(string $open, string $close): static
    {
        return $this->state(fn (array $attributes) => [
            'open_time' => $open,
            'close_time' => $close,
            'is_closed' => false,
        ]);
    }
}
