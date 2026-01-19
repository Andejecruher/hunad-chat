<?php

declare(strict_types=1);

namespace App\Services\Channels\Exceptions;

use Exception;
use Psr\Http\Message\ResponseInterface;

/**
 * Excepción personalizada para manejar errores de la API de WhatsApp Cloud.
 *
 * Proporciona información detallada sobre errores de la API, incluyendo códigos de error,
 * mensajes descriptivos y contexto adicional para debugging.
 */
class WhatsAppApiException extends Exception
{
    /**
     * Código de error de la API de WhatsApp.
     */
    protected ?int $apiErrorCode = null;

    /**
     * Tipo de error de la API de WhatsApp.
     */
    protected ?string $apiErrorType = null;

    /**
     * Detalles adicionales del error.
     */
    protected ?string $apiErrorDetails = null;

    /**
     * Response HTTP completa para debugging.
     */
    protected ?ResponseInterface $response = null;

    /**
     * Constructor de la excepción.
     *
     * @param  string  $message  Mensaje de error principal
     * @param  int  $code  Código de error HTTP
     * @param  Exception|null  $previous  Excepción anterior en la cadena
     * @param  int|null  $apiErrorCode  Código de error específico de la API de WhatsApp
     * @param  string|null  $apiErrorType  Tipo de error de la API
     * @param  string|null  $apiErrorDetails  Detalles adicionales del error
     * @param  ResponseInterface|null  $response  Response HTTP completa
     */
    public function __construct(
        string $message = '',
        int $code = 0,
        ?Exception $previous = null,
        ?int $apiErrorCode = null,
        ?string $apiErrorType = null,
        ?string $apiErrorDetails = null,
        ?ResponseInterface $response = null
    ) {
        parent::__construct($message, $code, $previous);

        $this->apiErrorCode = $apiErrorCode;
        $this->apiErrorType = $apiErrorType;
        $this->apiErrorDetails = $apiErrorDetails;
        $this->response = $response;
    }

    /**
     * Crea una excepción desde una respuesta de error de la API.
     *
     * @param  ResponseInterface  $response  Respuesta HTTP de la API
     * @param  array  $errorData  Datos del error parseados del JSON
     */
    public static function fromApiResponse(ResponseInterface $response, array $errorData): self
    {
        $message = $errorData['error']['message'] ?? 'Error desconocido de la API de WhatsApp';
        $apiErrorCode = $errorData['error']['code'] ?? null;
        $apiErrorType = $errorData['error']['type'] ?? null;
        $apiErrorDetails = $errorData['error']['error_user_title'] ?? $errorData['error']['error_user_msg'] ?? null;

        return new self(
            message: $message,
            code: $response->getStatusCode(),
            apiErrorCode: $apiErrorCode,
            apiErrorType: $apiErrorType,
            apiErrorDetails: $apiErrorDetails,
            response: $response
        );
    }

    /**
     * Crea una excepción para errores de conexión.
     *
     * @param  string  $message  Mensaje descriptivo del error
     * @param  Exception|null  $previous  Excepción anterior
     */
    public static function connectionError(string $message, ?Exception $previous = null): self
    {
        return new self(
            message: "Error de conexión con WhatsApp API: {$message}",
            code: 0,
            previous: $previous,
            apiErrorType: 'connection_error'
        );
    }

    /**
     * Crea una excepción para errores de autenticación.
     *
     * @param  string  $message  Mensaje descriptivo del error
     */
    public static function authenticationError(string $message = 'Token de acceso inválido o expirado'): self
    {
        return new self(
            message: $message,
            code: 401,
            apiErrorType: 'authentication_error'
        );
    }

    /**
     * Crea una excepción para errores de rate limiting.
     *
     * @param  int  $retryAfter  Segundos hasta que se pueda reintentar
     */
    public static function rateLimitError(int $retryAfter = 60): self
    {
        return new self(
            message: "Rate limit excedido. Reintentar después de {$retryAfter} segundos",
            code: 429,
            apiErrorType: 'rate_limit_error',
            apiErrorDetails: "retry_after:{$retryAfter}"
        );
    }

    /**
     * Obtiene el código de error de la API de WhatsApp.
     */
    public function getApiErrorCode(): ?int
    {
        return $this->apiErrorCode;
    }

    /**
     * Obtiene el tipo de error de la API de WhatsApp.
     */
    public function getApiErrorType(): ?string
    {
        return $this->apiErrorType;
    }

    /**
     * Obtiene los detalles adicionales del error.
     */
    public function getApiErrorDetails(): ?string
    {
        return $this->apiErrorDetails;
    }

    /**
     * Obtiene la respuesta HTTP completa.
     */
    public function getResponse(): ?ResponseInterface
    {
        return $this->response;
    }

    /**
     * Verifica si el error es recuperable (puede reintentarse).
     */
    public function isRetryable(): bool
    {
        return in_array($this->getCode(), [429, 500, 502, 503, 504]) ||
               in_array($this->apiErrorType, ['rate_limit_error', 'temporary_error']);
    }

    /**
     * Obtiene el tiempo de espera sugerido antes de reintentar.
     */
    public function getRetryAfter(): int
    {
        if ($this->apiErrorType === 'rate_limit_error' && $this->apiErrorDetails) {
            if (preg_match('/retry_after:(\d+)/', $this->apiErrorDetails, $matches)) {
                return (int) $matches[1];
            }
        }

        // Tiempos de espera por defecto según el código de error
        return match ($this->getCode()) {
            429 => 60,  // Rate limit
            500, 502, 503, 504 => 30,  // Errores del servidor
            default => 10
        };
    }

    /**
     * Convierte la excepción a un array para logging.
     */
    public function toArray(): array
    {
        return [
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'api_error_code' => $this->apiErrorCode,
            'api_error_type' => $this->apiErrorType,
            'api_error_details' => $this->apiErrorDetails,
            'is_retryable' => $this->isRetryable(),
            'retry_after' => $this->getRetryAfter(),
            'trace' => $this->getTraceAsString(),
        ];
    }
}
