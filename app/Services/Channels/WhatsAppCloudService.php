<?php

declare(strict_types=1);

namespace App\Services\Channels;

use App\Models\Channel;
use App\Services\Channels\Exceptions\WhatsAppApiException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

/**
 * Servicio para interactuar con la API de WhatsApp Cloud.
 *
 * Proporciona métodos para enviar mensajes, subir archivos multimedia,
 * consultar estados y manejar la autenticación con tokens cifrados.
 */
class WhatsAppCloudService
{
    /**
     * URL base de la API de WhatsApp Cloud.
     */
    private const API_BASE_URL = 'https://graph.facebook.com';

    /**
     * Versión de la API de WhatsApp.
     */
    private const API_VERSION = 'v21.0';

    /**
     * Tipos de mensajes soportados.
     */
    private const SUPPORTED_MESSAGE_TYPES = ['text', 'template', 'image', 'document', 'audio', 'video'];

    /**
     * Tipos de media soportados para upload.
     */
    private const SUPPORTED_MEDIA_TYPES = [
        'image' => ['image/jpeg', 'image/png', 'image/webp'],
        'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'audio' => ['audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg'],
        'video' => ['video/mp4', 'video/3gp'],
    ];

    /**
     * Constructor del servicio.
     */
    public function __construct(
        private readonly Channel $channel
    ) {}

    /**
     * Envía un mensaje de texto a WhatsApp.
     *
     * @param  string  $to  Número de teléfono del destinatario
     * @param  string  $message  Contenido del mensaje
     * @param  bool  $previewUrl  Si debe mostrar preview de URLs
     * @return array Respuesta normalizada de la API
     *
     * @throws WhatsAppApiException
     */
    public function sendTextMessage(string $to, string $message, bool $previewUrl = true): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $this->formatPhoneNumber($to),
            'type' => 'text',
            'text' => [
                'body' => $message,
                'preview_url' => $previewUrl,
            ],
        ];

        return $this->sendMessage($payload);
    }

    /**
     * Envía un mensaje usando una plantilla de WhatsApp.
     *
     * @param  string  $to  Número de teléfono del destinatario
     * @param  string  $templateName  Nombre de la plantilla
     * @param  string  $languageCode  Código de idioma (ej: 'es', 'en_US')
     * @param  array  $parameters  Parámetros para la plantilla
     * @return array Respuesta normalizada de la API
     *
     * @throws WhatsAppApiException
     */
    public function sendTemplateMessage(string $to, string $templateName, string $languageCode, array $parameters = []): array
    {
        $components = [];

        if (! empty($parameters)) {
            $components[] = [
                'type' => 'body',
                'parameters' => array_map(fn ($param) => ['type' => 'text', 'text' => (string) $param], $parameters),
            ];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $this->formatPhoneNumber($to),
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $languageCode,
                ],
                'components' => $components,
            ],
        ];

        return $this->sendMessage($payload);
    }

    /**
     * Envía un archivo multimedia.
     *
     * @param  string  $to  Número de teléfono del destinatario
     * @param  string  $mediaType  Tipo de media (image, document, audio, video)
     * @param  string  $mediaId  ID del archivo subido previamente
     * @param  string|null  $caption  Texto descriptivo (solo para image y video)
     * @param  string|null  $filename  Nombre del archivo (solo para document)
     * @return array Respuesta normalizada de la API
     *
     * @throws WhatsAppApiException
     */
    public function sendMediaMessage(string $to, string $mediaType, string $mediaId, ?string $caption = null, ?string $filename = null): array
    {
        if (! in_array($mediaType, ['image', 'document', 'audio', 'video'])) {
            throw new InvalidArgumentException("Tipo de media no soportado: {$mediaType}");
        }

        $mediaPayload = ['id' => $mediaId];

        // Agregar caption para images y videos
        if (in_array($mediaType, ['image', 'video']) && $caption) {
            $mediaPayload['caption'] = $caption;
        }

        // Agregar filename para documentos
        if ($mediaType === 'document' && $filename) {
            $mediaPayload['filename'] = $filename;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $this->formatPhoneNumber($to),
            'type' => $mediaType,
            $mediaType => $mediaPayload,
        ];

        return $this->sendMessage($payload);
    }

    /**
     * Sube un archivo multimedia a WhatsApp.
     *
     * @param  string  $filePath  Ruta del archivo a subir
     * @param  string  $mimeType  Tipo MIME del archivo
     * @return array Información del archivo subido incluyendo media_id
     *
     * @throws WhatsAppApiException
     */
    public function uploadMedia(string $filePath, string $mimeType): array
    {
        if (! file_exists($filePath)) {
            throw new InvalidArgumentException("El archivo no existe: {$filePath}");
        }

        if (! $this->isSupportedMimeType($mimeType)) {
            throw new InvalidArgumentException("Tipo MIME no soportado: {$mimeType}");
        }

        $phoneNumberId = $this->getPhoneNumberId();
        $url = $this->buildApiUrl("{$phoneNumberId}/media");

        try {
            $response = Http::withToken($this->getAccessToken())
                ->attach('file', file_get_contents($filePath), basename($filePath))
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'type' => $mimeType,
                ]);

            $this->logApiCall('POST', $url, ['type' => $mimeType], $response);

            if (! $response->successful()) {
                throw $this->createExceptionFromResponse($response);
            }

            $data = $response->json();

            return [
                'media_id' => $data['id'],
                'url' => $data['url'] ?? null,
                'mime_type' => $mimeType,
                'file_size' => filesize($filePath),
            ];

        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw WhatsAppApiException::connectionError($e->getMessage(), $e);
        }
    }

    /**
     * Obtiene información de un archivo multimedia.
     *
     * @param  string  $mediaId  ID del archivo multimedia
     * @return array Información del archivo
     *
     * @throws WhatsAppApiException
     */
    public function getMediaInfo(string $mediaId): array
    {
        $url = $this->buildApiUrl($mediaId);

        try {
            $response = Http::withToken($this->getAccessToken())
                ->get($url);

            $this->logApiCall('GET', $url, [], $response);

            if (! $response->successful()) {
                throw $this->createExceptionFromResponse($response);
            }

            return $response->json();

        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw WhatsAppApiException::connectionError($e->getMessage(), $e);
        }
    }

    /**
     * Descarga un archivo multimedia.
     *
     * @param  string  $mediaUrl  URL del archivo a descargar
     * @return string Contenido binario del archivo
     *
     * @throws WhatsAppApiException
     */
    public function downloadMedia(string $mediaUrl): string
    {
        try {
            $response = Http::withToken($this->getAccessToken())
                ->get($mediaUrl);

            $this->logApiCall('GET', $mediaUrl, [], $response);

            if (! $response->successful()) {
                throw $this->createExceptionFromResponse($response);
            }

            return $response->body();

        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw WhatsAppApiException::connectionError($e->getMessage(), $e);
        }
    }

    /**
     * Obtiene el estado de un mensaje enviado.
     *
     * @param  string  $messageId  ID del mensaje
     * @return array Estado del mensaje
     *
     * @throws WhatsAppApiException
     */
    public function getMessageStatus(string $messageId): array
    {
        $url = $this->buildApiUrl($messageId);

        try {
            $response = Http::withToken($this->getAccessToken())
                ->get($url);

            $this->logApiCall('GET', $url, [], $response);

            if (! $response->successful()) {
                throw $this->createExceptionFromResponse($response);
            }

            return $response->json();

        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw WhatsAppApiException::connectionError($e->getMessage(), $e);
        }
    }

    /**
     * Marca un mensaje como leído.
     *
     * @param  string  $messageId  ID del mensaje a marcar como leído
     * @return array Respuesta de la API
     *
     * @throws WhatsAppApiException
     */
    public function markMessageAsRead(string $messageId): array
    {
        $phoneNumberId = $this->getPhoneNumberId();
        $url = $this->buildApiUrl("{$phoneNumberId}/messages");

        $payload = [
            'messaging_product' => 'whatsapp',
            'status' => 'read',
            'message_id' => $messageId,
        ];

        try {
            $response = Http::withToken($this->getAccessToken())->post($url, $payload);

            $this->logApiCall('PUT', $url, $payload, $response);

            if (! $response->successful()) {
                throw $this->createExceptionFromResponse($response);
            }

            return $response->json();

        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw WhatsAppApiException::connectionError($e->getMessage(), $e);
        }
    }

    /**
     * Método principal para enviar mensajes.
     *
     * @param  array  $payload  Datos del mensaje a enviar
     * @return array Respuesta normalizada de la API
     *
     * @throws WhatsAppApiException
     */
    private function sendMessage(array $payload): array
    {
        $phoneNumberId = $this->getPhoneNumberId();
        $url = $this->buildApiUrl("{$phoneNumberId}/messages");

        try {
            $response = Http::withToken($this->getAccessToken())
                ->post($url, $payload);

            $this->logApiCall('POST', $url, $payload, $response);

            if (! $response->successful()) {
                throw $this->createExceptionFromResponse($response);
            }

            $data = $response->json();

            return [
                'message_id' => $data['messages'][0]['id'] ?? null,
                'status' => 'sent',
                'recipient' => $payload['to'],
                'timestamp' => now()->toISOString(),
            ];

        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw WhatsAppApiException::connectionError($e->getMessage(), $e);
        }
    }

    /**
     * Obtiene el token de acceso del canal (descifrado).
     *
     * @return string Token de acceso
     *
     * @throws WhatsAppApiException
     */
    private function getAccessToken(): string
    {
        $config = $this->channel->config ?? [];

        if (! isset($config['access_token'])) {
            throw WhatsAppApiException::authenticationError('Access token not configured for the channel');
        }

        try {
            return Crypt::decryptString($config['access_token']);
        } catch (\Exception $e) {
            throw WhatsAppApiException::authenticationError('Error decrypting access token');
        }
    }

    /**
     * Obtiene el Phone Number ID del canal.
     *
     * @return string Phone Number ID
     *
     * @throws WhatsAppApiException
     */
    private function getPhoneNumberId(): string
    {
        $config = $this->channel->config ?? [];

        if (! isset($config['whatsapp_phone_number_id'])) {
            throw new InvalidArgumentException('Phone Number ID not configured for the channel');
        }

        return $config['whatsapp_phone_number_id'];
    }

    /**
     * Construye la URL completa de la API.
     *
     * @param  string  $endpoint  Endpoint específico
     * @return string URL completa
     */
    private function buildApiUrl(string $endpoint): string
    {
        return self::API_BASE_URL.'/'.self::API_VERSION.'/'.$endpoint;
    }

    /**
     * Formatea un número de teléfono para WhatsApp.
     *
     * @param  string  $phoneNumber  Número de teléfono
     * @return string Número formateado
     */
    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Remover caracteres no numéricos excepto el +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // Si no empieza con +, agregarlo
        if (! str_starts_with($cleaned, '+')) {
            $cleaned = '+'.$cleaned;
        }

        return $cleaned;
    }

    /**
     * Verifica si un tipo MIME está soportado.
     *
     * @param  string  $mimeType  Tipo MIME a verificar
     */
    private function isSupportedMimeType(string $mimeType): bool
    {
        foreach (self::SUPPORTED_MEDIA_TYPES as $types) {
            if (in_array($mimeType, $types)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Crea una excepción desde una respuesta de error.
     *
     * @param  Response  $response  Respuesta HTTP
     */
    private function createExceptionFromResponse(Response $response): WhatsAppApiException
    {
        $data = $response->json();

        if (isset($data['error'])) {
            return WhatsAppApiException::fromApiResponse($response->toPsrResponse(), $data);
        }

        return new WhatsAppApiException(
            message: 'Error desconocido en la API de WhatsApp',
            code: $response->status(),
            response: $response->toPsrResponse()
        );
    }

    /**
     * Registra las llamadas a la API para debugging (sin exponer tokens).
     *
     * @param  string  $method  Método HTTP
     * @param  string  $url  URL de la llamada
     * @param  array  $payload  Datos enviados
     * @param  Response  $response  Respuesta recibida
     */
    private function logApiCall(string $method, string $url, array $payload, Response $response): void
    {
        $logData = [
            'method' => $method,
            'url' => $url,
            'payload' => $this->sanitizeLogData($payload),
            'status_code' => $response->status(),
            'response_size' => strlen($response->body()),
            'channel_id' => $this->channel->id,
            'company_id' => $this->channel->company_id,
        ];

        if (! $response->successful()) {
            $logData['response_body'] = $response->json();
            Log::error('WhatsApp API call failed', $logData);
        } else {
            Log::info('WhatsApp API call successful', $logData);
        }
    }

    /**
     * Sanitiza los datos para logging (remueve información sensible).
     *
     * @param  array  $data  Datos a sanitizar
     * @return array Datos sanitizados
     */
    private function sanitizeLogData(array $data): array
    {
        $sanitized = $data;

        // Remover o enmascarar campos sensibles
        $sensitiveFields = ['access_token', 'app_secret', 'verify_token'];

        foreach ($sensitiveFields as $field) {
            if (isset($sanitized[$field])) {
                $sanitized[$field] = '[REDACTED]';
            }
        }

        return $sanitized;
    }
}
