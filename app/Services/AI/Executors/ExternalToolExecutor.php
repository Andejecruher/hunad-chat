<?php

namespace App\Services\AI\Executors;

use App\Exceptions\ToolExecutionException;
use App\Models\Tool;
use App\Models\ToolExecution;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Ejecutor de herramientas externas vía HTTP
 * 
 * Se encarga de ejecutar llamadas HTTP a APIs externas con:
 * - Manejo de timeouts
 * - Reintentos automáticos
 * - Autenticación configurable
 * - Logging de errores
 */
class ExternalToolExecutor
{
    /**
     * Ejecutar herramienta externa
     * 
     * @param ToolExecution $execution
     * @return array Resultado de la ejecución
     * @throws ToolExecutionException
     */
    public function execute(ToolExecution $execution): array
    {
        $tool = $execution->tool;
        $config = $tool->config;
        $payload = $execution->payload;

        Log::info('Executing external tool', [
            'tool_slug' => $tool->slug,
            'url' => $config['url'] ?? 'unknown',
            'method' => $config['method'] ?? 'GET',
            'execution_id' => $execution->id,
        ]);

        try {
            $response = $this->makeHttpRequest($tool, $payload);
            
            $result = $this->processResponse($response, $tool);

            Log::info('External tool executed successfully', [
                'tool_slug' => $tool->slug,
                'execution_id' => $execution->id,
                'status_code' => $response->status(),
                'response_time' => $response->handlerStats()['total_time'] ?? null,
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error('External tool execution failed', [
                'tool_slug' => $tool->slug,
                'execution_id' => $execution->id,
                'error' => $e->getMessage(),
                'config' => $config,
            ]);

            throw ToolExecutionException::externalExecutionFailed($tool->name, $e->getMessage());
        }
    }

    /**
     * Realizar petición HTTP
     * 
     * @param Tool $tool
     * @param array $payload
     * @return Response
     * @throws ToolExecutionException
     */
    private function makeHttpRequest(Tool $tool, array $payload): Response
    {
        $config = $tool->config;
        
        // Validar configuración básica
        if (empty($config['url'])) {
            throw ToolExecutionException::externalExecutionFailed($tool->name, 'URL not configured');
        }

        if (empty($config['method'])) {
            throw ToolExecutionException::externalExecutionFailed($tool->name, 'HTTP method not configured');
        }

        $url = $config['url'];
        $method = strtoupper($config['method']);
        $timeout = $config['timeout'] ?? 30;
        $retries = $config['retries'] ?? 3;

        // Preparar cliente HTTP
        $http = Http::timeout($timeout)
            ->retry($retries, 1000)
            ->withHeaders($this->buildHeaders($config['headers'] ?? []));

        // Añadir autenticación si está configurada
        $http = $this->applyAuthentication($http, $config['auth'] ?? []);

        // Realizar petición según el método HTTP
        $response = match ($method) {
            'GET' => $http->get($url, $payload),
            'POST' => $http->post($url, $this->buildBody($payload, $config)),
            'PUT' => $http->put($url, $this->buildBody($payload, $config)),
            'PATCH' => $http->patch($url, $this->buildBody($payload, $config)),
            'DELETE' => $http->delete($url, $payload),
            default => throw ToolExecutionException::externalExecutionFailed(
                $tool->name,
                "Unsupported HTTP method: {$method}"
            ),
        };

        // Verificar respuesta exitosa
        if (!$response->successful()) {
            $errorMessage = "HTTP {$response->status()}: {$response->body()}";
            throw ToolExecutionException::externalExecutionFailed($tool->name, $errorMessage);
        }

        return $response;
    }

    /**
     * Construir headers HTTP
     * 
     * @param array $headerConfig
     * @return array
     */
    private function buildHeaders(array $headerConfig): array
    {
        $headers = [];

        foreach ($headerConfig as $header) {
            $key = $header['key'] ?? '';
            $value = $header['value'] ?? '';

            if (empty($key) || empty($value)) {
                continue;
            }

            // Procesar variables y secretos
            $value = $this->processHeaderValue($value);
            $headers[$key] = $value;
        }

        return $headers;
    }

    /**
     * Procesar valor de header (reemplazar variables, secretos, etc.)
     * 
     * @param string $value
     * @return string
     */
    private function processHeaderValue(string $value): string
    {
        // Reemplazar secretos: {{secret.api_key}}
        if (preg_match('/\{\{secret\.(.+)\}\}/', $value, $matches)) {
            $secretKey = $matches[1];
            // TODO: Implementar sistema de secretos seguro
            // Por ahora usar variables de entorno
            $secretValue = config("app.secrets.{$secretKey}") ?? env(strtoupper($secretKey));
            if ($secretValue) {
                return str_replace($matches[0], $secretValue, $value);
            }
        }

        // Reemplazar variables de entorno: {{env.VAR_NAME}}
        if (preg_match('/\{\{env\.(.+)\}\}/', $value, $matches)) {
            $envKey = $matches[1];
            $envValue = env($envKey);
            if ($envValue) {
                return str_replace($matches[0], $envValue, $value);
            }
        }

        return $value;
    }

    /**
     * Aplicar autenticación HTTP
     * 
     * @param \Illuminate\Http\Client\PendingRequest $http
     * @param array $authConfig
     * @return \Illuminate\Http\Client\PendingRequest
     */
    private function applyAuthentication($http, array $authConfig)
    {
        $type = $authConfig['type'] ?? null;

        return match ($type) {
            'bearer' => $http->withToken($authConfig['token'] ?? ''),
            'basic' => $http->withBasicAuth(
                $authConfig['username'] ?? '',
                $authConfig['password'] ?? ''
            ),
            'api_key' => $http->withHeaders([
                $authConfig['header'] ?? 'X-API-Key' => $authConfig['key'] ?? '',
            ]),
            default => $http, // Sin autenticación
        };
    }

    /**
     * Construir cuerpo de la petición
     * 
     * @param array $payload
     * @param array $config
     * @return array
     */
    private function buildBody(array $payload, array $config): array
    {
        // Si hay un body template en la config, usarlo
        if (isset($config['body']) && is_array($config['body'])) {
            return array_merge($config['body'], $payload);
        }

        // Por defecto, usar el payload directamente
        return $payload;
    }

    /**
     * Procesar respuesta HTTP
     * 
     * @param Response $response
     * @param Tool $tool
     * @return array
     */
    private function processResponse(Response $response, Tool $tool): array
    {
        $body = $response->json() ?? [];
        
        return [
            'status_code' => $response->status(),
            'response_body' => $body,
            'headers' => $response->headers(),
            'success' => $response->successful(),
            'execution_time' => $response->handlerStats()['total_time'] ?? null,
            'tool_name' => $tool->name,
            'timestamp' => now()->toISOString(),
        ];
    }
}