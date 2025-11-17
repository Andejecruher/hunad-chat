<?php

declare(strict_types=1);

namespace App\Http\Requests\Channel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request para validar la actualización de canales.
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
     * Obtiene las reglas de validación que aplican a la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $channel = $this->route('channel');

        return [
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

            // Campos específicos para WhatsApp
            'access_token' => [
                'sometimes',
                'string',
                'min:100',
            ],
            'phone_number_id' => [
                'sometimes',
                'string',
                'numeric',
            ],
            'business_id' => [
                'sometimes',
                'nullable',
                'string',
                'numeric',
            ],
            'app_secret' => [
                'sometimes',
                'nullable',
                'string',
                'min:32',
            ],

            // Campos específicos para otros canales
            'api_key' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'webhook_secret' => [
                'sometimes',
                'nullable',
                'string',
            ],
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
            'access_token.min' => 'El token de acceso debe tener al menos 100 caracteres.',
            'phone_number_id.numeric' => 'El ID del número de teléfono debe ser numérico.',
            'business_id.numeric' => 'El ID del negocio debe ser numérico.',
            'app_secret.min' => 'El app secret debe tener al menos 32 caracteres.',
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
            'phone_number_id' => 'ID del número de teléfono',
            'business_id' => 'ID del negocio',
            'app_secret' => 'secreto de la aplicación',
            'api_key' => 'clave de API',
            'webhook_secret' => 'secreto del webhook',
        ];
    }

    /**
     * Prepara los datos para validación.
     */
    protected function prepareForValidation(): void
    {
        // Limpiar el access_token de espacios en blanco
        if ($this->has('access_token')) {
            $this->merge([
                'access_token' => trim($this->input('access_token')),
            ]);
        }

        // Limpiar el phone_number_id
        if ($this->has('phone_number_id')) {
            $this->merge([
                'phone_number_id' => trim($this->input('phone_number_id')),
            ]);
        }
    }
}
