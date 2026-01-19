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
 * Job para enviar mensajes a WhatsApp Cloud API.
 *
 * Procesa mensajes pendientes en la cola, los envía a través del servicio
 * de WhatsApp y actualiza su estado en la base de datos. Maneja reintentos
 * automáticos con backoff exponencial.
 */
class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número máximo de intentos del job.
     */
    public int $tries = 5;

    /**
     * Tiempo máximo de ejecución en segundos.
     */
    public int $timeout = 120;

    /**
     * Backoff en segundos entre reintentos.
     */
    public array $backoff = [10, 30, 60, 300, 900]; // 10s, 30s, 1m, 5m, 15m

    /**
     * Constructor del job.
     *
     * @param  Message  $message  Mensaje a enviar
     */
    public function __construct(
        private readonly Message $message
    ) {}

    /**
     * Ejecuta el job.
     */
    public function handle(): void
    {
        try {
            // Verificar que el mensaje no haya sido enviado ya
            if ($this->message->status !== 'pending') {
                Log::info('WhatsApp message already processed', [
                    'message_id' => $this->message->id,
                    'status' => $this->message->status,
                ]);

                return;
            }

            // Cargar relaciones necesarias
            $this->message->load(['conversation.customer', 'conversation.channel']);

            $channel = $this->message->conversation->channel;
            $customer = $this->message->conversation->customer;

            // Verificar que es un canal de WhatsApp
            if ($channel->type !== 'whatsapp') {
                throw new \InvalidArgumentException('Message channel is not WhatsApp');
            }

            // Crear instancia del servicio
            $whatsappService = new WhatsAppCloudService($channel);

            // Enviar el mensaje según su tipo
            $response = $this->sendMessageByType($whatsappService, $customer->phone);

            // Actualizar el mensaje con la respuesta
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
     * Envía un mensaje multimedia.
     *
     * @param  WhatsAppCloudService  $service  Servicio de WhatsApp
     * @param  string  $recipient  Destinatario
     * @return array Respuesta de la API
     */
    private function sendMediaMessage(WhatsAppCloudService $service, string $recipient): array
    {
        $metadata = $this->message->metadata ?? [];
        $attachments = $this->message->attachments ?? [];

        if (empty($attachments)) {
            throw new \InvalidArgumentException('Media message requires attachments');
        }

        $attachment = $attachments[0]; // Primer archivo adjunto
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
     * Actualiza el mensaje después del envío exitoso.
     *
     * @param  array  $response  Respuesta de la API
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

        // Actualizar el estado del mensaje
        $this->updateMessageStatus('failed', [
            'error_code' => $exception->getApiErrorCode(),
            'error_type' => $exception->getApiErrorType(),
            'error_message' => $exception->getMessage(),
            'failed_at' => now()->toISOString(),
            'attempt' => $this->attempts(),
        ]);

        // Si el error es recuperable y aún tenemos intentos, reintentamos
        if ($exception->isRetryable() && $this->attempts() < $this->tries) {
            $retryAfter = $exception->getRetryAfter();
            $this->release($retryAfter);

            return;
        }

        // Si no es recuperable o agotamos los intentos, marcar como falló permanentemente
        $this->updateMessageStatus('failed_permanently');
        throw $exception;
    }

    /**
     * Maneja excepciones genéricas.
     *
     * @param  \Exception  $exception  Excepción genérica
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
     * Actualiza el estado del mensaje.
     *
     * @param  string  $status  Nuevo estado
     * @param  array  $additionalMetadata  Metadatos adicionales
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
     * Maneja fallos permanentes del job.
     *
     * @param  \Throwable  $exception  Excepción que causó el fallo
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
     * Calcula el tiempo de retardo para el siguiente intento.
     *
     * @param  int  $attempt  Número de intento
     * @return int Segundos de retardo
     */
    public function backoffFor(int $attempt): int
    {
        return $this->backoff[$attempt - 1] ?? 900; // Default 15 minutes
    }
}
