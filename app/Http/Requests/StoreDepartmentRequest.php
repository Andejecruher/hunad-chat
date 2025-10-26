<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // El usuario debe estar autenticado y tener acceso a su company
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'timezone' => 'required|string|max:50',
            'is_active' => 'boolean',
            'company_id' => 'required|exists:companies,id',

            // Reglas para horarios opcionales durante la creación
            'hours' => 'nullable|array',
            'hours.*.day_of_week' => 'required_with:hours|integer|between:0,6',
            'hours.*.open_time' => 'nullable|date_format:H:i',
            'hours.*.close_time' => 'nullable|date_format:H:i|after:hours.*.open_time',
            'hours.*.is_closed' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del departamento es requerido.',
            'name.max' => 'El nombre no puede exceder 255 caracteres.',
            'timezone.required' => 'La zona horaria es requerida.',
            'timezone.timezone' => 'La zona horaria debe ser válida.',
            'hours.*.close_time.after' => 'La hora de cierre debe ser posterior a la hora de apertura.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'company_id' => auth()->user()->company_id,
        ]);
    }
}
