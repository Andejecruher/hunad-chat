<?php

declare(strict_types=1);

namespace App\Jobs\Channels;

use App\Events\MessageReceived;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Message;
use App\Services\Channels\WhatsAppCloudService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Job para procesar mensajes entrantes de WhatsApp.
 *
 * Procesa el payload del webhook, identifica o crea clientes y conversaciones,
 * registra el mensaje y dispara eventos para actualizaciones en tiempo real.
 */
class ProcessIncomingWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número máximo de intentos del job.
     */
    public int $tries = 3;

    /**
     * Tiempo máximo de ejecución en segundos.
     */
    public int $timeout = 60;

    /**
     * Constructor del job.
     *
     * @param  Channel  $channel  Canal de WhatsApp
     * @param  array  $messageData  Datos del mensaje del webhook
     * @param  array  $contactsData  Información de contactos del webhook
     */
    public function __construct(
        private readonly Channel $channel,
        private readonly array $messageData,
        private readonly array $contactsData = []
    ) {}

    /**
     * Ejecuta el job.
     */
    public function handle(): void
    {
        try {
            DB::transaction(function () {
                $this->processIncomingMessage();
            });
        } catch (\Exception $e) {
            Log::error('Failed to process incoming WhatsApp message', [
                'channel_id' => $this->channel->id,
                'message_id' => $this->messageData['id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Procesa el mensaje entrante.
     */
    private function processIncomingMessage(): void
    {
        $messageId = $this->messageData['id'] ?? null;
        $from = $this->messageData['from'] ?? null;
        $timestamp = $this->messageData['timestamp'] ?? null;

        if (! $messageId || ! $from) {
            Log::warning('Invalid WhatsApp message data', [
                'channel_id' => $this->channel->id,
                'message_data' => $this->messageData,
            ]);

            return;
        }

        // Verificar si el mensaje ya fue procesado
        if (Message::where('external_id', $messageId)->exists()) {
            Log::info('WhatsApp message already processed', [
                'message_id' => $messageId,
                'channel_id' => $this->channel->id,
            ]);

            return;
        }

        // Buscar o crear el cliente
        $customer = $this->findOrCreateCustomer($from);

        // Buscar o crear la conversación
        $conversation = $this->findOrCreateConversation($customer);

        // Crear el mensaje
        $message = $this->createMessage($conversation, $messageId, $timestamp);

        // Marcar el mensaje como leído automáticamente
        $this->markMessageAsRead($messageId);

        // Disparar evento para actualizaciones en tiempo real
        MessageReceived::dispatch($message);

        Log::info('WhatsApp message processed successfully', [
            'message_id' => $messageId,
            'customer_id' => $customer->id,
            'conversation_id' => $conversation->id,
            'channel_id' => $this->channel->id,
        ]);
    }

    /**
     * Busca o crea un cliente basado en el número de teléfono.
     *
     * @param  string  $phoneNumber  Número de teléfono del cliente
     * @return Customer Cliente encontrado o creado
     */
    private function findOrCreateCustomer(string $phoneNumber): Customer
    {
        // Buscar cliente existente por teléfono en la misma empresa
        $customer = Customer::where('company_id', $this->channel->company_id)
            ->where('phone', $phoneNumber)
            ->first();

        if ($customer) {
            return $customer;
        }

        // Buscar información del contacto en los datos del webhook
        $contactInfo = $this->findContactInfo($phoneNumber);

        // Crear nuevo cliente
        return Customer::create([
            'company_id' => $this->channel->company_id,
            'name' => $contactInfo['name'] ?? null,
            'phone' => $phoneNumber,
            'external_id' => $phoneNumber, // Usar el teléfono como external_id para WhatsApp
        ]);
    }

    /**
     * Busca información del contacto en los datos del webhook.
     *
     * @param  string  $phoneNumber  Número de teléfono
     * @return array Información del contacto
     */
    private function findContactInfo(string $phoneNumber): array
    {
        foreach ($this->contactsData as $contact) {
            if (($contact['wa_id'] ?? null) === $phoneNumber) {
                return [
                    'name' => $contact['profile']['name'] ?? null,
                ];
            }
        }

        return [];
    }

    /**
     * Busca o crea una conversación para el cliente.
     *
     * @param  Customer  $customer  Cliente
     * @return Conversation Conversación encontrada o creada
     */
    private function findOrCreateConversation(Customer $customer): Conversation
    {
        // Buscar conversación abierta existente
        $conversation = Conversation::where('channel_id', $this->channel->id)
            ->where('customer_id', $customer->id)
            ->where('status', 'open')
            ->first();

        if ($conversation) {
            return $conversation;
        }

        // Crear nueva conversación
        return Conversation::create([
            'channel_id' => $this->channel->id,
            'customer_id' => $customer->id,
            'status' => 'open',
        ]);
    }

    /**
     * Crea el mensaje en la base de datos.
     *
     * @param  Conversation  $conversation  Conversación
     * @param  string  $messageId  ID del mensaje de WhatsApp
     * @param  string|null  $timestamp  Timestamp del mensaje
     * @return Message Mensaje creado
     */
    private function createMessage(Conversation $conversation, string $messageId, ?string $timestamp): Message
    {
        $messageContent = $this->extractMessageContent();
        $messageType = $this->extractMessageType();
        $attachments = $this->extractAttachments();

        return Message::create([
            'conversation_id' => $conversation->id,
            'external_id' => $messageId,
            'sender_type' => 'customer',
            'content' => $messageContent,
            'type' => $messageType,
            'attachments' => $attachments,
            'payload' => $this->messageData,
            'created_at' => $timestamp ? \Carbon\Carbon::createFromTimestamp((int) $timestamp) : now(),
        ]);
    }

    /**
     * Extrae el contenido del mensaje según su tipo.
     *
     * @return string Contenido del mensaje
     */
    private function extractMessageContent(): string
    {
        $type = $this->extractMessageType();

        return match ($type) {
            'text' => $this->messageData['text']['body'] ?? '',
            'image' => $this->messageData['image']['caption'] ?? '[Imagen]',
            'document' => $this->messageData['document']['filename'] ?? '[Documento]',
            'audio' => '[Audio]',
            'video' => $this->messageData['video']['caption'] ?? '[Video]',
            'voice' => '[Nota de voz]',
            'sticker' => '[Sticker]',
            'location' => $this->formatLocationMessage(),
            'contacts' => '[Contacto]',
            'interactive' => $this->extractInteractiveContent(),
            default => '[Mensaje no soportado]'
        };
    }

    /**
     * Extrae el tipo de mensaje.
     *
     * @return string Tipo de mensaje
     */
    private function extractMessageType(): string
    {
        return $this->messageData['type'] ?? 'text';
    }

    /**
     * Extrae los archivos adjuntos del mensaje.
     *
     * @return array|null Información de archivos adjuntos
     */
    private function extractAttachments(): ?array
    {
        $type = $this->extractMessageType();
        $attachments = [];

        switch ($type) {
            case 'image':
            case 'document':
            case 'audio':
            case 'video':
                $mediaData = $this->messageData[$type] ?? [];
                if (! empty($mediaData)) {
                    $attachments[] = [
                        'type' => $type,
                        'media_id' => $mediaData['id'] ?? null,
                        'mime_type' => $mediaData['mime_type'] ?? null,
                        'sha256' => $mediaData['sha256'] ?? null,
                        'filename' => $mediaData['filename'] ?? null,
                        'caption' => $mediaData['caption'] ?? null,
                    ];
                }
                break;
        }

        return empty($attachments) ? null : $attachments;
    }

    /**
     * Formatea un mensaje de ubicación.
     *
     * @return string Mensaje formateado
     */
    private function formatLocationMessage(): string
    {
        $location = $this->messageData['location'] ?? [];
        $latitude = $location['latitude'] ?? null;
        $longitude = $location['longitude'] ?? null;
        $name = $location['name'] ?? null;
        $address = $location['address'] ?? null;

        if ($latitude && $longitude) {
            $text = "[Ubicación] {$latitude}, {$longitude}";
            if ($name) {
                $text .= " - {$name}";
            }
            if ($address) {
                $text .= " ({$address})";
            }

            return $text;
        }

        return '[Ubicación]';
    }

    /**
     * Extrae el contenido de mensajes interactivos.
     *
     * @return string Contenido del mensaje interactivo
     */
    private function extractInteractiveContent(): string
    {
        $interactive = $this->messageData['interactive'] ?? [];
        $type = $interactive['type'] ?? null;

        return match ($type) {
            'button_reply' => $interactive['button_reply']['title'] ?? '[Botón presionado]',
            'list_reply' => $interactive['list_reply']['title'] ?? '[Opción seleccionada]',
            default => '[Mensaje interactivo]'
        };
    }

    /**
     * Marca el mensaje como leído en WhatsApp.
     *
     * @param  string  $messageId  ID del mensaje
     */
    private function markMessageAsRead(string $messageId): void
    {
        try {
            $whatsappService = new WhatsAppCloudService($this->channel);
            $whatsappService->markMessageAsRead($messageId);

            Log::debug('WhatsApp message marked as read', [
                'message_id' => $messageId,
                'channel_id' => $this->channel->id,
            ]);
        } catch (\Exception $e) {
            // No fallar el job si no se puede marcar como leído
            Log::warning('Failed to mark WhatsApp message as read', [
                'message_id' => $messageId,
                'channel_id' => $this->channel->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Maneja fallos del job.
     *
     * @param  \Throwable  $exception  Excepción que causó el fallo
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessIncomingWhatsAppMessage job failed permanently', [
            'channel_id' => $this->channel->id,
            'message_id' => $this->messageData['id'] ?? null,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
