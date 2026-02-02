<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Tool;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ToolFactory extends Factory
{
    protected $model = Tool::class;

    public function definition(): array
    {
        $name = $this->faker->words(2, true);
        $slug = Str::slug($name, '.');

        return [
            'company_id' => Company::factory(),
            'name' => ucfirst($name),
            'description' => $this->faker->sentence(),
            'slug' => $slug,
            'category' => $this->faker->randomElement([
                'ticket',
                'whatsapp',
                'conversation',
                'external',
            ]),
            'type' => $this->faker->randomElement(['internal', 'external']),
            'schema' => [
                'inputs' => [
                    ['name' => 'example_field', 'type' => 'string', 'required' => true, 'description' => 'Example field'],
                ],
                'outputs' => [
                    ['name' => 'success', 'type' => 'boolean', 'description' => 'Success flag'],
                ],
            ],
            'config' => [
                'handler' => 'example.handler',
            ],
            'enabled' => true,
            'last_executed_at' => null,
            'last_error' => null,
        ];
    }

    /* ===========================
     | Estados útiles
     =========================== */

    public function internal(): static
    {
        return $this->state(fn () => [
            'type' => 'internal',
            'config' => [
                'handler' => 'internal.example',
            ],
        ]);
    }

    public function external(): static
    {
        return $this->state(fn () => [
            'type' => 'external',
            'config' => [
                'method' => 'GET',
                'url' => 'https://api.example.com/resource/{id}',
                'headers' => [
                    'Authorization' => 'Bearer {{secret.api_key}}',
                ],
                'timeout' => 5000,
                'retry' => 2,
            ],
        ]);
    }
}
