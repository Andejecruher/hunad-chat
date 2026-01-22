<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Channel>
 */
class ChannelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['whatsapp']);

        // Generar configuraciones específicas por tipo siguiendo las interfaces TypeScript
        $config = match ($type) {
            'whatsapp' => [
                // Campos compatibles con backend (legacy/service expectations)
                'access_token' => $this->faker->sha1,
                'phone_number_id' => (string) $this->faker->randomNumber(8),
                'whatsapp_business_id' => (string) $this->faker->randomNumber(7),
                'whatsapp_phone_number_id' => (string) $this->faker->randomNumber(8),
            ],
        };

        return [
            'company_id' => Company::factory(),
            'name' => $this->faker->company.' '.ucfirst($type),
            'description' => $this->faker->sentence,
            'type' => $type,
            'external_id' => $this->faker->uuid,
            'config' => $config,
            'status' => $this->faker->randomElement(['active', 'inactive']),
        ];
    }
}
