<?php

declare(strict_types=1);

namespace App\Http\Requests\Channel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request para validar la creación de canales.
 */
class CreateChannelRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->company_id;
    }

    /**
     * Obtiene las reglas de validación que aplican a la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => [
                'required',
                'string',
                Rule::in(['whatsapp', 'instagram', 'facebook', 'telegram']),
            ],
            'external_id' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('channels')->where(function ($query) {
                    return $query->where('company_id', $this->user()->company_id)
                        ->where('type', $this->input('type'));
                }),
            ],

            // Campos específicos para WhatsApp
            'access_token' => [
                Rule::requiredIf($this->input('type') === 'whatsapp'),
                'string',
                'min:100', // Los tokens de Meta son largos
            ],
            'phone_number_id' => [
                Rule::requiredIf($this->input('type') === 'whatsapp'),
                'string',
                'numeric',
            ],
            'business_id' => [
                'nullable',
                'string',
                'numeric',
            ],
            'app_secret' => [
                'nullable',
                'string',
                'min:32',
            ],

            // Campos específicos para otros canales (futura expansión)
            'api_key' => [
                Rule::requiredIf(in_array($this->input('type'), ['telegram'])),
                'nullable',
                'string',
            ],
            'webhook_secret' => [
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
            'type.required' => 'El tipo de canal es requerido.',
            'type.in' => 'El tipo de canal debe ser uno de: whatsapp, instagram, facebook, telegram.',
            'external_id.unique' => 'Ya existe un canal de este tipo con este identificador externo.',
            'access_token.required' => 'El token de acceso es requerido para canales de WhatsApp.',
            'access_token.min' => 'El token de acceso debe tener al menos 100 caracteres.',
            'phone_number_id.required' => 'El ID del número de teléfono es requerido para WhatsApp.',
            'phone_number_id.numeric' => 'El ID del número de teléfono debe ser numérico.',
            'business_id.numeric' => 'El ID del negocio debe ser numérico.',
            'app_secret.min' => 'El app secret debe tener al menos 32 caracteres.',
            'api_key.required' => 'La API key es requerida para este tipo de canal.',
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
            'type' => 'tipo de canal',
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
