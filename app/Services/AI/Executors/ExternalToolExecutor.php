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
     * @return array Resultado de la ejecución
     *
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
            'payload' => $payload,
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
     * @throws ToolExecutionException
     */
    private function makeHttpRequest(Tool $tool, array $payload): Response
    {
        $config = $tool->config;

        if (empty($config['url'])) {
            throw ToolExecutionException::externalExecutionFailed($tool->name, 'URL not configured');
        }

        if (empty($config['method'])) {
            throw ToolExecutionException::externalExecutionFailed($tool->name, 'HTTP method not configured');
        }

        $urlTemplate = $config['url'];
        $method = strtoupper($config['method']);
        $timeout = $config['timeout'] ?? 30;
        $retries = $config['retries'] ?? 3;

        [$resolvedUrl, $payloadForRequest] = $this->resolveUrlAndPayload($urlTemplate, $payload);

        $http = Http::timeout($timeout)
            ->retry($retries, 1000)
            ->withHeaders($this->buildHeaders($config['headers'] ?? []));

        $http = $this->applyAuthentication($http, $config['auth'] ?? []);

        $response = match ($method) {
            'GET' => $this->sendGetRequest($http, $resolvedUrl, $payloadForRequest),
            'POST' => $this->sendJsonBodyRequest($http, 'post', $resolvedUrl, $payloadForRequest, $config),
            'PUT' => $this->sendJsonBodyRequest($http, 'put', $resolvedUrl, $payloadForRequest, $config),
            'PATCH' => $this->sendJsonBodyRequest($http, 'patch', $resolvedUrl, $payloadForRequest, $config),
            'DELETE' => $this->sendDeleteRequest($http, $resolvedUrl, $payloadForRequest, $config),
            default => throw ToolExecutionException::externalExecutionFailed(
                $tool->name,
                "Unsupported HTTP method: {$method}"
            ),
        };

        if (! $response->successful()) {
            $errorMessage = "HTTP {$response->status()}: {$response->body()}";
            throw ToolExecutionException::externalExecutionFailed($tool->name, $errorMessage);
        }

        return $response;
    }

    /**
     * Enviar petición GET con query params (excluyendo valores usados en la URL)
     *
     * @param  \Illuminate\Http\Client\PendingRequest  $http
     */
    private function sendGetRequest($http, string $url, array $payloadForRequest): Response
    {
        $query = $payloadForRequest;

        return $http->get($url, $query);
    }

    /**
     * Enviar POST/PUT/PATCH como JSON body
     *
     * @param  \Illuminate\Http\Client\PendingRequest  $http
     */
    private function sendJsonBodyRequest($http, string $method, string $url, array $payloadForRequest, array $config): Response
    {
        $body = $this->buildBody($payloadForRequest, $config);
        $request = $http->asJson();

        return $request->{$method}($url, $body);
    }

    /**
     * Enviar DELETE. Por defecto sin body, salvo configuración explícita.
     *
     * @param  \Illuminate\Http\Client\PendingRequest  $http
     */
    private function sendDeleteRequest($http, string $url, array $payloadForRequest, array $config): Response
    {
        $sendPayload = $config['send_payload_on_delete'] ?? false;

        if ($sendPayload && ! empty($payloadForRequest)) {
            $body = $this->buildBody($payloadForRequest, $config);
            $request = $http->withBody(json_encode($body), 'application/json');

            return $request->delete($url);
        }

        return $http->delete($url);
    }

    /**
     * Construir headers HTTP
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

            $value = $this->processHeaderValue($value);
            $headers[$key] = $value;
        }

        return $headers;
    }

    /**
     * Procesar valor de header (reemplazar variables, secretos, etc.)
     */
    private function processHeaderValue(string $value): string
    {
        if (preg_match('/\{\{secret\.(.+)\}\}/', $value, $matches)) {
            $secretKey = $matches[1];
            $secretValue = config("app.secrets.{$secretKey}") ?? env(strtoupper($secretKey));
            if ($secretValue) {
                return str_replace($matches[0], $secretValue, $value);
            }
        }

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
     * @param  \Illuminate\Http\Client\PendingRequest  $http
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
            default => $http,
        };
    }

    /**
     * Construir cuerpo de la petición
     */
    private function buildBody(array $payload, array $config): array
    {
        if (isset($config['body']) && is_array($config['body'])) {
            return array_merge($config['body'], $payload);
        }

        return $payload;
    }

    /**
     * Procesar respuesta HTTP
     */
    private function processResponse(Response $response, Tool $tool): array
    {
        $body = $response->json() ?? [];

        // Filtrar el body para incluir solo las propiedades definidas en el schema.outputs
        $filteredBody = $this->filterResponseBody($body, $tool);

        return [
            'status_code' => $response->status(),
            'response_body' => $filteredBody,
            'headers' => $response->headers(),
            'success' => $response->successful(),
            'execution_time' => $response->handlerStats()['total_time'] ?? null,
            'tool_name' => $tool->name,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Filtra el response body para devolver solo las keys definidas en el schema.outputs
     * Si no hay schema o outputs definidos, devuelve el body original.
     * Soporta bodies asociativos o listas de objetos.
     */
    private function filterResponseBody(mixed $body, Tool $tool): mixed
    {
        $allowed = [];
        $schema = $tool->schema ?? null;

        if (is_array($schema) && isset($schema['outputs']) && is_array($schema['outputs'])) {
            foreach ($schema['outputs'] as $field) {
                if (is_array($field) && isset($field['name'])) {
                    $allowed[] = $field['name'];
                }
            }
        }

        // Si no hay restricciones en el schema, devolver el body tal cual
        if (empty($allowed) || ! is_array($body)) {
            return $body;
        }

        $allowedFlip = array_flip($allowed);

        // Si es una lista de elementos -> filtrar cada elemento si es array
        if (function_exists('array_is_list') && array_is_list($body)) {
            $result = [];
            foreach ($body as $item) {
                if (is_array($item)) {
                    $result[] = array_intersect_key($item, $allowedFlip);
                } else {
                    $result[] = $item;
                }
            }

            return $result;
        }

        // Asociativo -> intersect
        return array_intersect_key($body, $allowedFlip);
    }

    /**
     * Resolver placeholders en la URL y devolver payload restante sin mutar el original.
     *
     * @return array [resolvedUrl, remainingPayload]
     *
     * @throws ToolExecutionException
     */
    private function resolveUrlAndPayload(string $urlTemplate, array $payload): array
    {
        $payloadCopy = $payload;
        if (preg_match_all('/\{([^}]+)\}/', $urlTemplate, $matches)) {
            $placeholders = $matches[1];

            foreach ($placeholders as $placeholder) {
                $value = $this->getValueByPath($payloadCopy, $placeholder);

                if ($value === null) {
                    throw ToolExecutionException::externalExecutionFailed(
                        'external_tool',
                        "Missing value for URL placeholder: {$placeholder}"
                    );
                }

                $encoded = rawurlencode((string) $value);
                $urlTemplate = str_replace("{{$placeholder}}", $encoded, $urlTemplate);

                $this->unsetValueByPath($payloadCopy, $placeholder);
            }
        }

        return [$urlTemplate, $payloadCopy];
    }

    /**
     * Obtener valor anidado del array usando notación punto.
     *
     * @return mixed|null
     */
    private function getValueByPath(array $data, string $path)
    {
        $segments = explode('.', $path);
        $current = $data;

        foreach ($segments as $segment) {
            if (is_array($current) && array_key_exists($segment, $current)) {
                $current = $current[$segment];
            } else {
                return null;
            }
        }

        return $current;
    }

    /**
     * Eliminar clave (posible anidada) del array usando notación punto.
     */
    private function unsetValueByPath(array &$data, string $path): void
    {
        $segments = explode('.', $path);
        $ref = &$data;

        while (count($segments) > 1) {
            $segment = array_shift($segments);

            if (! isset($ref[$segment]) || ! is_array($ref[$segment])) {
                return;
            }

            $ref = &$ref[$segment];
        }

        $final = array_shift($segments);

        if (is_array($ref) && array_key_exists($final, $ref)) {
            unset($ref[$final]);
        }
    }
}
