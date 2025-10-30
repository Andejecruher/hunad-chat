<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Verificar que el departamento pertenece a la company del usuario autenticado
        $department = $this->route('department');
        return auth()->check() &&
               $department &&
               $department->company_id === auth()->user()->company_id;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
            'timezone' => 'sometimes|required|string|max:50',
            'is_active' => 'boolean',

            // Reglas para actualización de horarios
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
            'color.required' => 'El color del departamento es requerido.',
            'name.required' => 'El nombre del departamento es requerido.',
            'name.max' => 'El nombre no puede exceder 255 caracteres.',
            'timezone.required' => 'La zona horaria es requerida.',
            'timezone.timezone' => 'La zona horaria debe ser válida.',
            'hours.*.close_time.after' => 'La hora de cierre debe ser posterior a la hora de apertura.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => $this->boolean('is_active'),
            ]);
        }
    }
}
