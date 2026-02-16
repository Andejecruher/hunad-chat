<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class DomainEventBroadcast implements ShouldBroadcast
{
    public function __construct(
        public readonly string $eventName,
        public readonly ?int $companyId,
        public readonly ?int $conversationId,
        public readonly array $payload
    ) {}

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->companyId) {
            $channels[] = new PrivateChannel("company.{$this->companyId}");
        }

        if ($this->conversationId) {
            $channels[] = new PrivateChannel("conversation.{$this->conversationId}");
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return $this->eventName;
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}