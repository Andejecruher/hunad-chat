<?php

namespace Tests\Feature;

use App\Events\MessageBroadcasted;
use App\Models\Channel;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageBroadcastTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_is_broadcasted_on_conversation_channel()
    {
        Broadcast::fake();

        $company = Company::create(['name' => 'TestCo', 'slug' => 'testco']);

        $channel = Channel::create([
            'name' => 'WhatsApp',
            'company_id' => $company->id,
            'type' => 'whatsapp',
            'status' => 'active',
            'config' => [],
        ]);

        $customer = Customer::create([
            'company_id' => $company->id,
            'phone' => '+10000000000',
            'name' => 'Customer',
            'external_id' => '+10000000000',
        ]);

        $conversation = Conversation::create([
            'channel_id' => $channel->id,
            'customer_id' => $customer->id,
            'status' => 'open',
        ]);

        $user = User::create([
            'name' => 'Agent',
            'email' => Str::random(8) . '@example.com',
            'password' => 'password',
            'company_id' => $company->id,
        ]);

        // Perform store action through controller route
        $this->actingAs($user)
            ->post(route('conversations.messages.store', $conversation), ['content' => 'Hello realtime']);

        Broadcast::assertBroadcasted(MessageBroadcasted::class, function ($event, $channels) use ($conversation) {
            $hasChannel = false;
            foreach ($channels as $ch) {
                if (str_contains($ch, "conversation.{$conversation->id}")) {
                    $hasChannel = true;
                    break;
                }
            }

            return $hasChannel && isset($event->message) && $event->message->content === 'Hello realtime';
        });
    }
}
