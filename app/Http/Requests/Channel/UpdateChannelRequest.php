<?php

declare(strict_types=1);

namespace App\Http\Requests\Channel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request para validar la actualización de canales.
 *
 * Normaliza `config` cuando viene como JSON string o arreglo y
 * mapea claves de `config` a campos de primer nivel si no se enviaron.
 */
class UpdateChannelRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize(): bool
    {
        $channel = $this->route('channel');

        return $this->user() &&
            $this->user()->company_id === $channel->company_id;
    }

    /**
     * Prepara los datos para validación.
     *
     * - Decodifica `config` si viene como JSON string.
     * - Mapea claves desde `config` hacia campos top-level sólo si no existen ya.
     * - Realiza limpieza básica (trim) de tokens e ids.
     */
    protected function prepareForValidation(): void
    {
        $config = $this->input('config');

        if (is_string($config)) {
            $decoded = json_decode($config, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['config' => $decoded]);
                $config = $decoded;
            }
        }

        if (is_array($config)) {
            $map = [
                'access_token' => $config['access_token'] ?? null,
                'phone_number_id' => $config['phone_number_id'] ?? null,
                // acepta ambos nombres: whatsapp_business_id o business_id
                'whatsapp_business_id' => $config['whatsapp_business_id'] ?? $config['business_id'] ?? null,
                'whatsapp_phone_number_id' => $config['whatsapp_phone_number_id'] ?? null,
                'whatsapp_app_id' => $config['whatsapp_app_id'] ?? null,
                'whatsapp_app_secret' => $config['whatsapp_app_secret'] ?? null,
            ];

            $merge = [];

            foreach ($map as $key => $value) {
                if (! $this->has($key) && $value !== null) {
                    // limpiar valores escalarmente
                    $merge[$key] = is_string($value) ? trim($value) : $value;
                }
            }

            if (! empty($merge)) {
                $this->merge($merge);
            }
        }

        // Limpieza general si vienen top-level fields
        if ($this->has('access_token')) {
            $this->merge(['access_token' => trim((string) $this->input('access_token'))]);
        }
    }

    /**
     * Obtiene las reglas de validación que aplican a la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $channel = $this->route('channel');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
            'external_id' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('channels')->where(function ($query) use ($channel) {
                    return $query->where('company_id', $this->user()->company_id)
                        ->where('type', $channel->type)
                        ->where('id', '!=', $channel->id);
                }),
            ],

            // Soporte para enviar config como objeto/array
            'config' => ['sometimes', 'nullable', 'array'],
            'config.access_token' => ['sometimes', 'nullable', 'string', 'min:100'],
            'config.phone_number_id' => ['sometimes', 'nullable', 'string', 'regex:/^\d+$/'],
            'config.whatsapp_business_id' => ['sometimes', 'nullable', 'string', 'regex:/^\d+$/'],
            'config.whatsapp_phone_number_id' => ['sometimes', 'nullable', 'string', 'regex:/^\d+$/'],
            'config.whatsapp_app_id' => ['sometimes', 'nullable', 'string'],
            'config.whatsapp_app_secret' => ['sometimes', 'nullable', 'string'],
        ];
    }

    /**
     * Obtiene los mensajes de error personalizados.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'external_id.unique' => 'Ya existe un canal de este tipo con este identificador externo.',
            'access_token.min' => 'El token de acceso debe tener al menos :min caracteres.',
            'config.access_token.min' => 'El token de acceso dentro de `config` debe tener al menos :min caracteres.',
            'phone_number_id.regex' => 'El ID del número de teléfono debe contener solo dígitos.',
            'config.phone_number_id.regex' => 'El ID del número de teléfono en `config` debe contener solo dígitos.',
            'config.whatsapp_business_id.regex' => 'El ID del negocio en `config` debe contener solo dígitos.',
            'config.whatsapp_phone_number_id.regex' => 'El ID del número de teléfono de WhatsApp en `config` debe contener solo dígitos.',
            'config.whatsapp_app_id.string' => 'El ID de la aplicación de WhatsApp en `config` debe ser una cadena de texto.',
            'config.whatsapp_app_secret.string' => 'El secreto de la aplicación de WhatsApp en `config` debe ser una cadena de texto.',
        ];
    }

    /**
     * Obtiene los atributos personalizados para los errores de validación.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'external_id' => 'identificador externo',
            'access_token' => 'token de acceso',
            'config.access_token' => 'token de acceso',
            'phone_number_id' => 'ID del número de teléfono',
            'config.phone_number_id' => 'ID del número de teléfono',
            'business_id' => 'ID del negocio',
            'config.whatsapp_business_id' => 'ID del negocio',
            'whatsapp_phone_number_id' => 'ID del número de teléfono de WhatsApp',
            'app_secret' => 'secreto de la aplicación',
            'api_key' => 'clave de API',
            'webhook_secret' => 'secreto del webhook',
        ];
    }
}
