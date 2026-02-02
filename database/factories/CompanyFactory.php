<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company,
            'slug' => $this->faker->unique()->slug,
            'branding' => [
                'theme' => [
                    'light' => [
                        'colors' => [
                            'primary' => $this->faker->hexColor(),
                            'secondary' => $this->faker->hexColor(),
                        ],
                    ],
                    'dark' => [
                        'colors' => [
                            'primary' => $this->faker->hexColor(),
                            'secondary' => $this->faker->hexColor(),
                        ],
                    ],
                ],
                'logo_url' => 'https://picsum.photos/200/200',
                'default_theme' => $this->faker->randomElement(['light', 'dark']),
            ],
            'subscription_type' => $this->faker->randomElement(['free', 'basic', 'pro', 'enterprise']),
            'subscription_expires_at' => $this->faker->optional()->dateTimeBetween('now', '+1 year'),
        ];
    }
}
