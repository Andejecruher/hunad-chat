<?php

namespace Database\Factories;

use App\Models\AiAgent;
use App\Models\Tool;
use App\Models\ToolExecution;
use Illuminate\Database\Eloquent\Factories\Factory;

class ToolExecutionFactory extends Factory
{
    protected $model = ToolExecution::class;

    public function definition(): array
    {
        return [
            'tool_id' => Tool::factory(),
            'ai_agent_id' => AiAgent::factory(),
            'payload' => [
                'example' => 'value',
            ],
            'status' => $this->faker->randomElement([
                'accepted',
                'success',
                'failed',
            ]),
            'result' => null,
            'error' => null,
        ];
    }

    /* ===========================
     | Estados
     =========================== */

    public function success(): static
    {
        return $this->state(fn () => [
            'status' => 'success',
            'result' => [
                'id' => 123,
            ],
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'error' => [
                'message' => 'Execution failed',
            ],
        ]);
    }
}
