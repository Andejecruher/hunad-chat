<?php

namespace App\Http\Requests\Conversation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $companyId = $this->user()?->company_id ?? 0;

        return [
            'client_phone' => ['required', 'string', 'max:30'],
            'channel_id' => [
                'required',
                'integer',
                Rule::exists('channels', 'id')->where('company_id', $companyId),
            ],
            'message' => ['nullable', 'string', 'max:2000', 'required_without:template_id'],
            'template_id' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'client_phone.required' => 'El telefono del cliente es obligatorio.',
            'channel_id.required' => 'La linea es obligatoria.',
            'message.required_without' => 'Debes escribir un mensaje o elegir un template.',
        ];
    }
}
