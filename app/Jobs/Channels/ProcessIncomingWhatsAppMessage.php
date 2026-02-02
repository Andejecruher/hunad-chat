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
 * Job to process incoming WhatsApp messages.
 *
 * Processes the webhook payload, identifies or creates customers and conversations,
 * stores the message and dispatches events for real-time updates.
 */
class ProcessIncomingWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maximum number of attempts for the job.
     */
    public int $tries = 3;

    /**
     * Maximum execution time in seconds.
     */
    public int $timeout = 60;

    /**
     * Job constructor.
     *
     * @param  Channel  $channel  WhatsApp channel
     * @param  array  $messageData  Message data from the webhook
     * @param  array  $contactsData  Contacts information from the webhook
     */
    public function __construct(
        private readonly Channel $channel,
        private readonly array $messageData,
        private readonly array $contactsData = []
    ) {}

    /**
     * Execute the job.
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
     * Process the incoming message.
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

        // Check if the message has already been processed
        if (Message::where('external_id', $messageId)->exists()) {
            Log::info('WhatsApp message already processed', [
                'message_id' => $messageId,
                'channel_id' => $this->channel->id,
            ]);

            return;
        }

        // Find or create the customer
        $customer = $this->findOrCreateCustomer($from);

        // Find or create the conversation
        $conversation = $this->findOrCreateConversation($customer);

        // Create the message
        $message = $this->createMessage($conversation, $messageId, $timestamp);

        // Mark the message as read automatically
        $this->markMessageAsRead($messageId);

        // Dispatch event for real-time updates
        MessageReceived::dispatch($message);

        Log::info('WhatsApp message processed successfully', [
            'message_id' => $messageId,
            'customer_id' => $customer->id,
            'conversation_id' => $conversation->id,
            'channel_id' => $this->channel->id,
        ]);
    }

    /**
     * Find or create a customer based on phone number.
     *
     * @param  string  $phoneNumber  Customer phone number
     * @return Customer Found or created customer
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

        // Find contact information in webhook data
        $contactInfo = $this->findContactInfo($phoneNumber);

        // Create new customer
        return Customer::create([
            'company_id' => $this->channel->company_id,
            'name' => $contactInfo['name'] ?? null,
            'phone' => $phoneNumber,
            'external_id' => $phoneNumber, // Usar el teléfono como external_id para WhatsApp
        ]);
    }

    /**
     * Find contact information in the webhook data.
     *
     * @param  string  $phoneNumber  Phone number
     * @return array Contact information
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
     * Find or create a conversation for the customer.
     *
     * @param  Customer  $customer  Customer
     * @return Conversation Found or created conversation
     */
    private function findOrCreateConversation(Customer $customer): Conversation
    {
        // Look for an existing open conversation
        $conversation = Conversation::where('channel_id', $this->channel->id)
            ->where('customer_id', $customer->id)
            ->where('status', 'open')
            ->first();

        if ($conversation) {
            return $conversation;
        }

        // Create a new conversation
        return Conversation::create([
            'channel_id' => $this->channel->id,
            'customer_id' => $customer->id,
            'status' => 'open',
        ]);
    }

    /**
     * Create the message in the database.
     *
     * @param  Conversation  $conversation
     * @param  string  $messageId  WhatsApp message ID
     * @param  string|null  $timestamp  Message timestamp
     * @return Message Created message
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
     * Extract the message content according to its type.
     *
     * @return string Message content
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
     * Extract the message type.
     *
     * @return string Message type
     */
    private function extractMessageType(): string
    {
        return $this->messageData['type'] ?? 'text';
    }

    /**
     * Extract attachments from the message.
     *
     * @return array|null Attachments information
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
     * Format a location message.
     *
     * @return string Formatted message
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
     * Extract interactive message content.
     *
     * @return string Interactive message content
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
     * Mark the message as read on WhatsApp.
     *
     * @param  string  $messageId  Message ID
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
            // Do not fail the job if marking as read fails
            Log::warning('Failed to mark WhatsApp message as read', [
                'message_id' => $messageId,
                'channel_id' => $this->channel->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failures.
     *
     * @param  \Throwable  $exception  Exception that caused the failure
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
