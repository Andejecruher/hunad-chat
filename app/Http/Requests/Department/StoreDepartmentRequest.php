<?php

namespace App\Http\Requests\Department;

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
            'color' => 'required|string|max:50',
            'timezone' => 'required|string|max:50',
            'is_active' => 'boolean',
            'company_id' => 'required|exists:companies,id',

            // Reglas para horarios opcionales durante la creación
            'hours' => 'nullable|array',
            'hours.*.day_of_week' => 'required_with:hours|integer|between:0,6',
            'hours.*.open_time' => 'nullable|date_format:H:i',
            'hours.*.close_time' => 'nullable|date_format:H:i|after:hours.*.open_time',
            'hours.*.is_closed' => 'boolean',

            // Rules for department exceptions
            'exceptions' => 'nullable|array',
            'exceptions.*.name' => 'required_with:exceptions|string|max:255',
            'exceptions.*.type' => 'required_with:exceptions|in:annual,monthly,specific',
            'exceptions.*.start_date' => 'required_with:exceptions|date',
            'exceptions.*.end_date' => 'nullable|date|after_or_equal:exceptions.*.start_date',
            'exceptions.*.behavior' => 'required_with:exceptions|in:fully_closed,partially_closed,partially_open',
            'exceptions.*.special_open_time' => [
                'nullable',
                'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/',
            ],
            'exceptions.*.special_close_time' => [
                'nullable',
                'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/',
            ],
            'exceptions.*.recurrence_pattern' => 'nullable|array',
            'exceptions.*.partial_hours' => 'nullable|array',
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

            // Exception validation messages
            'exceptions.*.name.required_with' => 'Cada excepción debe tener un nombre.',
            'exceptions.*.name.max' => 'El nombre de la excepción no puede exceder 255 caracteres.',
            'exceptions.*.type.required_with' => 'Cada excepción debe tener un tipo.',
            'exceptions.*.type.in' => 'El tipo de excepción debe ser: annual, monthly o specific.',
            'exceptions.*.start_date.required_with' => 'Cada excepción debe tener una fecha de inicio.',
            'exceptions.*.start_date.date' => 'La fecha de inicio debe ser una fecha válida.',
            'exceptions.*.end_date.date' => 'La fecha de fin debe ser una fecha válida.',
            'exceptions.*.end_date.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
            'exceptions.*.behavior.required_with' => 'Cada excepción debe tener un comportamiento definido.',
            'exceptions.*.behavior.in' => 'El comportamiento debe ser: fully_closed, partially_closed o partially_open.',
            'exceptions.*.special_open_time.regex' => 'El formato de la hora especial de apertura debe ser HH:mm o HH:mm:ss.',
            'exceptions.*.special_close_time.regex' => 'El formato de la hora especial de cierre debe ser HH:mm o HH:mm:ss.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'company_id' => auth()->user()->company_id,
        ]);

        // Normalize exceptions array before validation
        if ($this->has('exceptions') && is_array($this->exceptions)) {
            $normalized = collect($this->exceptions)->map(function ($exception) {
                // Si ya es un array, usarlo directamente; si es string, decodificar JSON
                $decoded = is_array($exception) ? $exception : json_decode($exception, true);

                return [
                    'id' => $decoded['id'] ?? null,
                    'name' => $decoded['name'] ?? '',
                    'type' => $decoded['type'] ?? 'specific',
                    'start_date' => $decoded['start_date'] ?? null,
                    'end_date' => $decoded['end_date'] ?? null,
                    'behavior' => $decoded['behavior'] ?? 'fully_closed',
                    'special_open_time' => $decoded['special_open_time'] ?? null,
                    'special_close_time' => $decoded['special_close_time'] ?? null,
                    'recurrence_pattern' => $decoded['recurrence_pattern'] ?? null,
                    'partial_hours' => $decoded['partial_hours'] ?? null,
                ];
            })->toArray();

            $this->merge(['exceptions' => $normalized]);
        }
    }
}
