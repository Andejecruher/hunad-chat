<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento disparado cuando se recibe un nuevo mensaje.
 *
 * Se usa para notificaciones en tiempo real y actualizaciones
 * de la interfaz de usuario.
 */
class MessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Constructor del evento.
     *
     * @param  Message  $message  Mensaje recibido
     */
    public function __construct(
        public readonly Message $message
    ) {}

    /**
     * Obtiene los canales en los que el evento debe ser transmitido.
     *
     * @return array<int, Channel|PrivateChannel|PresenceChannel>
     */
    public function broadcastOn(): array
    {
        $conversation = $this->message->conversation;

        return [
            // Canal privado para la empresa
            new PrivateChannel("company.{$conversation->channel->company_id}"),

            // Canal privado para la conversación específica
            new PrivateChannel("conversation.{$conversation->id}"),
        ];
    }

    /**
     * Nombre del evento que se transmite.
     */
    public function broadcastAs(): string
    {
        return 'message.received';
    }

    /**
     * Datos que se transmiten con el evento.
     */
    public function broadcastWith(): array
    {
        $this->message->load(['conversation.customer', 'conversation.channel']);

        return [
            'message' => [
                'id' => $this->message->id,
                'external_id' => $this->message->external_id,
                'content' => $this->message->content,
                'sender_type' => $this->message->sender_type,
                'type' => $this->message->type,
                'attachments' => $this->message->attachments,
                'created_at' => $this->message->created_at->toISOString(),
            ],
            'conversation' => [
                'id' => $this->message->conversation->id,
                'status' => $this->message->conversation->status,
                'channel' => [
                    'id' => $this->message->conversation->channel->id,
                    'type' => $this->message->conversation->channel->type,
                ],
                'customer' => [
                    'id' => $this->message->conversation->customer->id,
                    'name' => $this->message->conversation->customer->name,
                    'phone' => $this->message->conversation->customer->phone,
                ],
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Determina si el evento debe ser transmitido.
     */
    public function shouldBroadcast(): bool
    {
        // Solo transmitir mensajes de clientes (no de agentes o IA)
        return $this->message->sender_type === 'customer';
    }
}
