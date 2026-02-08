<?php

declare(strict_types=1);

namespace App\Jobs\Channels;

use App\Models\Message;
use App\Services\Channels\Exceptions\WhatsAppApiException;
use App\Services\Channels\WhatsAppCloudService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to send messages to the WhatsApp Cloud API.
 *
 * Processes pending messages in the queue, sends them via the WhatsApp service
 * and updates their status in the database. Handles automatic retries with
 * exponential backoff.
 */
class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maximum number of attempts for the job.
     */
    public int $tries = 5;

    /**
     * Maximum execution time in seconds.
     */
    public int $timeout = 120;

    /**
     * Backoff in seconds between retries.
     */
    public array $backoff = [10, 30, 60, 300, 900]; // 10s, 30s, 1m, 5m, 15m

    /**
     * Job constructor.
     *
     * @param  Message  $message  Message to send
     */
    public function __construct(
        private readonly Message $message
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Verify that the message has not already been sent
            if ($this->message->status !== 'pending') {
                Log::info('WhatsApp message already processed', [
                    'message_id' => $this->message->id,
                    'status' => $this->message->status,
                ]);

                return;
            }

            // Load required relations
            $this->message->load(['conversation.customer', 'conversation.channel']);

            $channel = $this->message->conversation->channel;
            $customer = $this->message->conversation->customer;

            // Verify this is a WhatsApp channel
            if ($channel->type !== 'whatsapp') {
                throw new \InvalidArgumentException('Message channel is not WhatsApp');
            }

            // Instantiate the service
            $whatsappService = new WhatsAppCloudService($channel);

            // Send the message according to its type
            $response = $this->sendMessageByType($whatsappService, $customer->phone);

            // Update message status and metadata after successful sending
            $this->updateMessageAfterSending($response);

            Log::info('WhatsApp message sent successfully', [
                'message_id' => $this->message->id,
                'external_id' => $response['message_id'] ?? null,
                'recipient' => $customer->phone,
                'channel_id' => $channel->id,
            ]);

        } catch (WhatsAppApiException $e) {
            $this->handleWhatsAppException($e);
        } catch (\Exception $e) {
            $this->handleGenericException($e);
        }
    }

    /**
     * Envía el mensaje según su tipo.
     *
     * @param  WhatsAppCloudService  $service  Servicio de WhatsApp
     * @param  string  $recipient  Número de teléfono del destinatario
     * @return array Respuesta de la API
     *
     * @throws WhatsAppApiException
     */
    private function sendMessageByType(WhatsAppCloudService $service, string $recipient): array
    {
        return match ($this->message->type ?? 'text') {
            'text' => $this->sendTextMessage($service, $recipient),
            'template' => $this->sendTemplateMessage($service, $recipient),
            'image', 'document', 'audio', 'video' => $this->sendMediaMessage($service, $recipient),
            default => throw new \InvalidArgumentException("Unsupported message type: {$this->message->type}")
        };
    }

    /**
     * Envía un mensaje de texto.
     *
     * @param  WhatsAppCloudService  $service  Servicio de WhatsApp
     * @param  string  $recipient  Destinatario
     * @return array Respuesta de la API
     */
    private function sendTextMessage(WhatsAppCloudService $service, string $recipient): array
    {
        $previewUrl = $this->message->metadata['preview_url'] ?? true;

        return $service->sendTextMessage(
            to: $recipient,
            message: $this->message->content,
            previewUrl: $previewUrl
        );
    }

    /**
     * Envía un mensaje de plantilla.
     *
     * @param  WhatsAppCloudService  $service  Servicio de WhatsApp
     * @param  string  $recipient  Destinatario
     * @return array Respuesta de la API
     */
    private function sendTemplateMessage(WhatsAppCloudService $service, string $recipient): array
    {
        $metadata = $this->message->metadata ?? [];

        $templateName = $metadata['template_name'] ?? throw new \InvalidArgumentException('Template name is required');
        $languageCode = $metadata['language_code'] ?? 'es';
        $parameters = $metadata['parameters'] ?? [];

        return $service->sendTemplateMessage(
            to: $recipient,
            templateName: $templateName,
            languageCode: $languageCode,
            parameters: $parameters
        );
    }

    /**
     * Send a media message.
     *
     * @return array API response
     */
    private function sendMediaMessage(WhatsAppCloudService $service, string $recipient): array
    {
        $metadata = $this->message->metadata ?? [];
        $attachments = $this->message->attachments ?? [];

        if (empty($attachments)) {
            throw new \InvalidArgumentException('Media message requires attachments');
        }

        $attachment = $attachments[0]; // First attachment
        $mediaId = $attachment['media_id'] ?? throw new \InvalidArgumentException('Media ID is required');
        $caption = $attachment['caption'] ?? $this->message->content;
        $filename = $attachment['filename'] ?? null;

        return $service->sendMediaMessage(
            to: $recipient,
            mediaType: $this->message->type,
            mediaId: $mediaId,
            caption: $caption,
            filename: $filename
        );
    }

    /**
     * Update the message after successful sending.
     *
     * @param  array  $response  API response
     */
    private function updateMessageAfterSending(array $response): void
    {
        $this->message->update([
            'external_id' => $response['message_id'],
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => array_merge($this->message->metadata ?? [], [
                'api_response' => $response,
                'sent_timestamp' => $response['timestamp'] ?? now()->toISOString(),
            ]),
        ]);
    }

    /**
     * Maneja excepciones específicas de WhatsApp API.
     *
     * @param  WhatsAppApiException  $exception  Excepción de WhatsApp
     *
     * @throws WhatsAppApiException
     */
    private function handleWhatsAppException(WhatsAppApiException $exception): void
    {
        Log::error('WhatsApp API error in SendWhatsAppMessageJob', [
            'message_id' => $this->message->id,
            'error_code' => $exception->getApiErrorCode(),
            'error_type' => $exception->getApiErrorType(),
            'error_message' => $exception->getMessage(),
            'is_retryable' => $exception->isRetryable(),
            'attempt' => $this->attempts(),
        ]);

        // Update message status
        $this->updateMessageStatus('failed', [
            'error_code' => $exception->getApiErrorCode(),
            'error_type' => $exception->getApiErrorType(),
            'error_message' => $exception->getMessage(),
            'failed_at' => now()->toISOString(),
            'attempt' => $this->attempts(),
        ]);

        // If the error is retryable and attempts remain, retry
        if ($exception->isRetryable() && $this->attempts() < $this->tries) {
            $retryAfter = $exception->getRetryAfter();
            $this->release($retryAfter);

            return;
        }

        // If not retryable or attempts exhausted, mark as permanently failed
        $this->updateMessageStatus('failed_permanently');
        throw $exception;
    }

    /**
     * Handle generic exceptions.
     *
     * @throws \Exception
     */
    private function handleGenericException(\Exception $exception): void
    {
        Log::error('Generic error in SendWhatsAppMessageJob', [
            'message_id' => $this->message->id,
            'error_message' => $exception->getMessage(),
            'error_trace' => $exception->getTraceAsString(),
            'attempt' => $this->attempts(),
        ]);

        $this->updateMessageStatus('failed', [
            'error_message' => $exception->getMessage(),
            'failed_at' => now()->toISOString(),
            'attempt' => $this->attempts(),
        ]);

        throw $exception;
    }

    /**
     * Update the message status.
     */
    private function updateMessageStatus(string $status, array $additionalMetadata = []): void
    {
        $metadata = array_merge($this->message->metadata ?? [], $additionalMetadata);

        $this->message->update([
            'status' => $status,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Handle permanent job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendWhatsAppMessageJob failed permanently', [
            'message_id' => $this->message->id,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'total_attempts' => $this->attempts(),
        ]);

        $this->updateMessageStatus('failed_permanently', [
            'final_error' => $exception->getMessage(),
            'failed_permanently_at' => now()->toISOString(),
            'total_attempts' => $this->attempts(),
        ]);
    }

    /**
     * Calculate backoff time for the next attempt.
     *
     * @return int Seconds of delay
     */
    public function backoffFor(int $attempt): int
    {
        return $this->backoff[$attempt - 1] ?? 900; // Default 15 minutes
    }
}
