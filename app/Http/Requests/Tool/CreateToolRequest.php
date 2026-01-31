<?php

namespace App\Http\Requests\Tool;

use App\Services\AI\ToolValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only authenticated users can create tools
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'type' => 'required|in:internal,external',
            'description' => 'nullable|string|max:1000',
            'schema' => 'required|string|json',
            'config' => 'required|string|json',
            'enabled' => 'boolean',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The tool name is required.',
            'name.max' => 'The name cannot exceed 255 characters.',
            'category.required' => 'The category is required.',
            'type.required' => 'The tool type is required.',
            'type.in' => 'The type must be internal or external.',
            'schema.required' => 'The schema is required.',
            'schema.inputs.required' => 'The input fields are required.',
            'schema.outputs.required' => 'The output fields are required.',
            'schema.inputs.*.name.required' => 'The input field name is required.',
            'schema.inputs.*.type.required' => 'The input field type is required.',
            'schema.inputs.*.type.in' => 'The field type must be valid.',
            'schema.outputs.*.name.required' => 'The output field name is required.',
            'schema.outputs.*.type.required' => 'The output field type is required.',
            'config.required' => 'The configuration is required.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure enabled has a default value
        if (! $this->has('enabled')) {
            $this->merge(['enabled' => true]);
        }
    }

    /**
     * Configurar validación adicional después de la validación estándar
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Decodificar schema si viene como string
            $schema = $this->input('schema');
            if (is_string($schema)) {
                $schema = json_decode($schema, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $validator->errors()->add('schema', 'El schema debe ser un JSON válido.');

                    return;
                }
            }

            // Validar schema completo usando el ToolValidator
            if ($schema) {
                $toolValidator = app(ToolValidator::class);
                $schemaErrors = $toolValidator->validateToolSchema($schema);

                if (! empty($schemaErrors)) {
                    foreach ($schemaErrors as $error) {
                        $validator->errors()->add('schema', $error);
                    }
                }
            }

            // Validación específica por tipo de herramienta
            if ($this->input('type') === 'internal') {
                $this->validateInternalConfig($validator);
            } elseif ($this->input('type') === 'external') {
                $this->validateExternalConfig($validator);
            }
        });
    }

    /**
     * Validar configuración de herramientas internas
     */
    private function validateInternalConfig($validator): void
    {
        $configString = $this->input('config', '');
        $config = is_string($configString) ? json_decode($configString, true) : $configString;

        if (! is_array($config)) {
            $validator->errors()->add('config', 'La configuración debe ser un JSON válido.');

            return;
        }

        if (! isset($config['action'])) {
            $validator->errors()->add('config.action', 'La acción es requerida para herramientas internas.');
        } elseif (! in_array($config['action'], ['create_ticket', 'transfer_department', 'send_message', 'close_conversation', 'assign_agent'])) {
            $validator->errors()->add('config.action', 'Acción inválida para herramienta interna.');
        }
    }

    /**
     * Validar configuración de herramientas externas
     */
    private function validateExternalConfig($validator): void
    {
        $configString = $this->input('config', '');
        $config = is_string($configString) ? json_decode($configString, true) : $configString;

        if (! is_array($config)) {
            $validator->errors()->add('config', 'La configuración debe ser un JSON válido.');

            return;
        }

        // URL requerida
        if (! isset($config['url']) || empty($config['url'])) {
            $validator->errors()->add('config.url', 'La URL es requerida para herramientas externas.');
        } elseif (! filter_var($config['url'], FILTER_VALIDATE_URL)) {
            $validator->errors()->add('config.url', 'La URL debe ser válida.');
        }

        // Método HTTP requerido
        if (! isset($config['method']) || empty($config['method'])) {
            $validator->errors()->add('config.method', 'El método HTTP es requerido para herramientas externas.');
        } elseif (! in_array(strtoupper($config['method']), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) {
            $validator->errors()->add('config.method', 'Método HTTP inválido.');
        }

        // Timeout opcional pero debe ser numérico
        if (isset($config['timeout']) && (! is_numeric($config['timeout']) || $config['timeout'] < 1)) {
            $validator->errors()->add('config.timeout', 'El timeout debe ser un número mayor a 0.');
        }

        // Headers opcional pero debe ser array
        if (isset($config['headers']) && ! is_array($config['headers'])) {
            $validator->errors()->add('config.headers', 'Los headers deben ser un array.');
        }
    }
}
