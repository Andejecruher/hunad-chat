<?php

namespace Tests\Feature\Conversations;

use App\Models\Channel;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ConversationPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversations_index_renders_with_messages(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->for($company)->create();
        $channel = Channel::factory()->for($company)->create(['status' => 'active']);
        $customer = Customer::factory()->for($company)->create();

        $conversation = Conversation::factory()
            ->for($channel, 'channel')
            ->for($customer, 'customer')
            ->create([
                'assigned_agent_id' => null,
                'status' => 'open',
            ]);

        Message::factory()
            ->for($conversation, 'conversation')
            ->create([
                'content' => 'Hola',
                'sender_type' => 'customer',
            ]);

        $this->actingAs($user)
            ->get(route('conversations.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('conversations/index')
                ->has('conversations.data', 1)
                ->has('conversationsMeta')
                ->has('messages.data', 1)
                ->has('messagesMeta')
                ->where('selectedConversationId', (string) $conversation->id)
            );
    }

    public function test_agent_can_send_message(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->for($company)->create();
        $channel = Channel::factory()->for($company)->create();
        $customer = Customer::factory()->for($company)->create();

        $conversation = Conversation::factory()
            ->for($channel, 'channel')
            ->for($customer, 'customer')
            ->create([
                'assigned_agent_id' => null,
                'status' => 'open',
            ]);

        $this->actingAs($user)
            ->post(route('conversations.messages.store', $conversation), [
                'content' => 'Nuevo mensaje',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'content' => 'Nuevo mensaje',
            'sender_type' => 'agent',
        ]);
    }
}
