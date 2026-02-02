<?php

namespace Database\Factories;

use App\Models\Agent;
use App\Models\Channel;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'channel_id' => Channel::factory(),
            'customer_id' => Customer::factory(),
            'assigned_agent_id' => Agent::factory(),
            'status' => $this->faker->randomElement(['open', 'pending', 'closed']),
        ];
    }
}
