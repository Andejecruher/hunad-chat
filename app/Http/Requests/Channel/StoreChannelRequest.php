<?php

namespace App\Http\Requests\Channel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request para crear Channel.
 *
 * Normaliza `config` si viene como JSON string y valida su estructura.
 */
class StoreChannelRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return (bool) ($user && $user->company_id);
    }

    protected function prepareForValidation(): void
    {
        $config = $this->input('config');

        if (is_string($config)) {
            $decoded = json_decode($config, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['config' => $decoded]);
            }
            // si no es JSON válido, dejamos el valor original para que falle la validación de tipo
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'string', Rule::in(['whatsapp', 'instagram', 'facebook', 'telegram'])],
            'config' => ['nullable', 'array'],
            // Validaciones opcionales para keys esperadas dentro de config
            'config.access_token' => ['nullable', 'string', 'min:10'],
            'config.phone_number_id' => ['nullable', 'string'],
            'config.whatsapp_business_id' => ['nullable', 'string'],
            'config.whatsapp_phone_number_id' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'config.array' => 'El campo `config` debe ser un objeto JSON o un arreglo.',
            'config.access_token.min' => 'El access_token debe tener al menos :min caracteres.',
        ];
    }
}
