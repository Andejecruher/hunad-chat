<?php

namespace Database\Factories;

use App\Models\AiAgent;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class AiAgentFactory extends Factory
{
    protected $model = AiAgent::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => 'Agente '.ucfirst($this->faker->word()),
            'context' => [
                'role' => 'customer_support',
                'language' => 'es',
                'tone' => 'friendly',
            ],
            'rules' => [
                [
                    'when' => [
                        'intent' => 'create_ticket',
                        'confidence' => ['gte' => 0.7],
                    ],
                    'then' => [
                        'tool' => 'ticket.create',
                    ],
                ],
            ],
            'enabled' => true,
        ];
    }

    /* ===========================
     | Estados
     =========================== */

    public function disabled(): static
    {
        return $this->state(fn () => [
            'enabled' => false,
        ]);
    }
}
