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
                'theme' => $this->faker->randomElement(['light', 'dark']),
                'colors' => [
                    'primary' => '#3366FF',
                    'secondary' => '#FF9933',
                ],
                'logo_url' => $this->faker->imageUrl(200, 200, 'business', true),
            ],
        ];
    }
}
