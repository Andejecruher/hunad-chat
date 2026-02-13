<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

final class MessageBroadcasted implements ShouldBroadcast
{
    public function __construct(public Message $message) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("conversation.{$this->message->conversation_id}");
    }

    public function broadcastAs(): string
    {
        return 'message.broadcasted';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'body' => $this->message->content,
            'sender_type' => $this->message->sender_type,
            'conversation_id' => $this->message->conversation_id,
            'created_at' => $this->message->created_at,
        ];
    }
}
