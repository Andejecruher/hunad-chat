<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Events\DomainEventBroadcast;
use App\Models\OutboxEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PublishOutboxEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public function __construct(public readonly int $outboxEventId) {}

    public function handle(): void
    {
        $event = OutboxEvent::find($this->outboxEventId);
        if (! $event) {
            return;
        }

        try {
            $eventName = sprintf('%s.%s', $event->version, $event->type);

            event(new DomainEventBroadcast(
                eventName: $eventName,
                companyId: $event->company_id,
                conversationId: $event->conversation_id,
                payload: $event->payload ?? []
            ));

            $event->update([
                'status' => 'published',
                'attempts' => ($event->attempts ?? 0) + 1,
                'published_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to publish outbox event', [
                'outbox_event_id' => $event->id,
                'error' => $e->getMessage(),
            ]);

            $event->update([
                'status' => 'failed',
                'attempts' => ($event->attempts ?? 0) + 1,
            ]);

            throw $e;
        }
    }
}
