<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $department = $this->route('department');

        return auth()->check()
            && $department
            && $department->company_id === auth()->user()->company_id;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
            'timezone' => 'sometimes|required|string|max:50',
            'is_active' => 'boolean',

            // Rules for department hours
            'hours' => 'nullable|array',
            'hours.*.day_of_week' => 'required_with:hours|integer|between:0,6',

            // Allow flexible time formats (H:i or H:i:s)
            'hours.*.open_time' => [
                'nullable',
                'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/',
            ],
            'hours.*.close_time' => [
                'nullable',
                'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/',
            ],
            'hours.*.is_closed' => 'boolean',

            // Rules for department exceptions
            'exceptions' => 'nullable|array',
            'exceptions.*.name' => 'required_with:exceptions.*|string|max:255',
            'exceptions.*.type' => 'required_with:exceptions.*|in:annual,monthly,specific',
            'exceptions.*.start_date' => 'nullable|date',
            'exceptions.*.end_date' => 'nullable|date|after_or_equal:exceptions.*.start_date',
            'exceptions.*.behavior' => 'required_with:exceptions.*|in:fully_closed,partially_closed,partially_open',
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
            'color.required' => 'El color del departamento es requerido.',
            'name.required' => 'El nombre del departamento es requerido.',
            'name.max' => 'El nombre no puede exceder 255 caracteres.',
            'timezone.required' => 'La zona horaria es requerida.',
            'timezone.timezone' => 'La zona horaria debe ser válida.',
            'hours.*.day_of_week.required_with' => 'Cada horario debe incluir el día de la semana.',
            'hours.*.open_time.regex' => 'El formato de la hora de apertura debe ser HH:mm o HH:mm:ss.',
            'hours.*.close_time.regex' => 'El formato de la hora de cierre debe ser HH:mm o HH:mm:ss.',

            // Exception validation messages
            'exceptions.*.name.required_with' => 'Cada excepción debe tener un nombre.',
            'exceptions.*.name.max' => 'El nombre de la excepción no puede exceder 255 caracteres.',
            'exceptions.*.type.required_with' => 'Cada excepción debe tener un tipo.',
            'exceptions.*.type.in' => 'El tipo de excepción debe ser: annual, monthly o specific.',
            'exceptions.*.start_date.required_with' => 'Cada excepción debe tener una fecha de inicio válida.',
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
        // Convert boolean-like fields properly
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => $this->boolean('is_active'),
            ]);
        }

        // Normalize hours array before validation
        if ($this->has('hours') && is_array($this->hours)) {
            $normalized = collect($this->hours)->map(function ($hour) {
                // Si ya es un array, usarlo directamente; si es string, decodificar JSON
                $decoded = is_array($hour) ? $hour : json_decode($hour, true);

                if (isset($decoded['time_ranges']) && is_array($decoded['time_ranges'])) {
                    // Si tiene múltiples rangos, mantener la estructura completa
                    return [
                        'day_of_week' => isset($decoded['day_of_week']) ? (int) $decoded['day_of_week'] : null,
                        'time_ranges' => $decoded['time_ranges'],
                        'is_closed' => isset($decoded['is_closed']) ? (bool) $decoded['is_closed'] : false,
                    ];
                } else {
                    // Estructura de compatibilidad para datos que no tienen time_ranges
                    return [
                        'day_of_week' => isset($decoded['day_of_week']) ? (int) $decoded['day_of_week'] : null,
                        'time_ranges' => [],
                        'is_closed' => isset($decoded['is_closed']) ? (bool) $decoded['is_closed'] : true,
                    ];
                }
            })->toArray();

            $this->merge(['hours' => $normalized]);
        }

        // Normalize exceptions array before validation
        if ($this->has('exceptions') && is_array($this->exceptions)) {
            $normalized = collect($this->exceptions)->map(function ($exception) {
                // Si ya es un array, usarlo directamente; si es string, decodificar JSON
                $decoded = is_array($exception) ? $exception : json_decode($exception, true);

                // Limpiar cadenas vacías y convertirlas a null
                $startDate = $decoded['start_date'] ?? null;
                if (is_string($startDate) && (trim($startDate) === '' || $startDate === '0000-00-00' || $startDate === '0000-00-00 00:00:00')) {
                    $startDate = null;
                }

                $endDate = $decoded['end_date'] ?? null;
                if (is_string($endDate) && (trim($endDate) === '' || $endDate === '0000-00-00' || $endDate === '0000-00-00 00:00:00')) {
                    $endDate = null;
                }

                // También limpiar campos especiales de tiempo
                $specialOpenTime = $decoded['special_open_time'] ?? null;
                if (is_string($specialOpenTime) && trim($specialOpenTime) === '') {
                    $specialOpenTime = null;
                }

                $specialCloseTime = $decoded['special_close_time'] ?? null;
                if (is_string($specialCloseTime) && trim($specialCloseTime) === '') {
                    $specialCloseTime = null;
                }

                return [
                    'id' => $decoded['id'] ?? null,
                    'name' => $decoded['name'] ?? '',
                    'type' => $decoded['type'] ?? 'specific',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'behavior' => $decoded['behavior'] ?? 'fully_closed',
                    'special_open_time' => $specialOpenTime,
                    'special_close_time' => $specialCloseTime,
                    'recurrence_pattern' => $decoded['recurrence_pattern'] ?? null,
                    'partial_hours' => $decoded['partial_hours'] ?? null,
                ];
            })->toArray();

            $this->merge(['exceptions' => $normalized]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->has('exceptions') && is_array($this->exceptions)) {
                foreach ($this->exceptions as $index => $exception) {
                    // Validar que las excepciones que tienen name también tengan start_date
                    if (! empty($exception['name']) && (empty($exception['start_date']) || is_null($exception['start_date']))) {
                        $validator->errors()->add(
                            "exceptions.{$index}.start_date",
                            'Cada excepción debe tener una fecha de inicio válida.'
                        );
                    }
                }
            }
        });
    }
}
