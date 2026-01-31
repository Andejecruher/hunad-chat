<?php

namespace App\Http\Requests;

use App\Services\AI\ToolValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo usuarios autenticados pueden actualizar herramientas
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|required|in:internal,external',
            'schema' => 'sometimes|required|array',
            'schema.inputs' => 'sometimes|required|array',
            'schema.inputs.*.name' => 'required|string|max:100',
            'schema.inputs.*.type' => 'required|in:string,number,integer,boolean,array,object',
            'schema.inputs.*.required' => 'boolean',
            'schema.inputs.*.description' => 'nullable|string|max:500',
            'schema.outputs' => 'sometimes|required|array',
            'schema.outputs.*.name' => 'required|string|max:100',
            'schema.outputs.*.type' => 'required|in:string,number,integer,boolean,array,object',
            'schema.outputs.*.description' => 'nullable|string|max:500',
            'config' => 'sometimes|required|array',
            'enabled' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la herramienta es requerido.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'category.required' => 'La categoría es requerida.',
            'type.required' => 'El tipo de herramienta es requerido.',
            'type.in' => 'El tipo debe ser interno o externo.',
            'schema.required' => 'El schema es requerido.',
            'schema.inputs.required' => 'Los campos de entrada son requeridos.',
            'schema.outputs.required' => 'Los campos de salida son requeridos.',
            'config.required' => 'La configuración es requerida.',
        ];
    }

    /**
     * Configurar validación adicional después de la validación estándar
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validar schema completo usando el ToolValidator si está presente
            if ($this->has('schema')) {
                $toolValidator = app(ToolValidator::class);
                $schemaErrors = $toolValidator->validateToolSchema($this->input('schema'));
                
                if (!empty($schemaErrors)) {
                    foreach ($schemaErrors as $error) {
                        $validator->errors()->add('schema', $error);
                    }
                }
            }

            // Validación específica por tipo de herramienta si el tipo está siendo actualizado
            if ($this->has('type')) {
                if ($this->input('type') === 'internal') {
                    $this->validateInternalConfig($validator);
                } elseif ($this->input('type') === 'external') {
                    $this->validateExternalConfig($validator);
                }
            }
        });
    }

    /**
     * Validar configuración de herramientas internas
     */
    private function validateInternalConfig($validator): void
    {
        if (!$this->has('config')) {
            return; // Si no se está actualizando la config, no validar
        }

        $config = $this->input('config', []);

        if (!isset($config['action'])) {
            $validator->errors()->add('config.action', 'La acción es requerida para herramientas internas.');
        } elseif (!in_array($config['action'], ['create_ticket', 'transfer_department', 'send_message', 'close_conversation', 'assign_agent'])) {
            $validator->errors()->add('config.action', 'Acción inválida para herramienta interna.');
        }
    }

    /**
     * Validar configuración de herramientas externas
     */
    private function validateExternalConfig($validator): void
    {
        if (!$this->has('config')) {
            return; // Si no se está actualizando la config, no validar
        }

        $config = $this->input('config', []);

        // URL requerida
        if (!isset($config['url']) || empty($config['url'])) {
            $validator->errors()->add('config.url', 'La URL es requerida para herramientas externas.');
        } elseif (!filter_var($config['url'], FILTER_VALIDATE_URL)) {
            $validator->errors()->add('config.url', 'La URL debe ser válida.');
        }

        // Método HTTP requerido
        if (!isset($config['method']) || empty($config['method'])) {
            $validator->errors()->add('config.method', 'El método HTTP es requerido para herramientas externas.');
        } elseif (!in_array(strtoupper($config['method']), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) {
            $validator->errors()->add('config.method', 'Método HTTP inválido.');
        }

        // Timeout opcional pero debe ser numérico
        if (isset($config['timeout']) && (!is_numeric($config['timeout']) || $config['timeout'] < 1)) {
            $validator->errors()->add('config.timeout', 'El timeout debe ser un número mayor a 0.');
        }

        // Headers opcional pero debe ser array
        if (isset($config['headers']) && !is_array($config['headers'])) {
            $validator->errors()->add('config.headers', 'Los headers deben ser un array.');
        }
    }
}
