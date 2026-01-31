<?php

namespace App\Http\Requests\Tool;

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
        // Only authenticated users can update tools
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
            'name.required' => 'The tool name is required.',
            'name.max' => 'The name cannot exceed 255 characters.',
            'category.required' => 'The category is required.',
            'type.required' => 'The tool type is required.',
            'type.in' => 'The type must be internal or external.',
            'schema.required' => 'The schema is required.',
            'schema.inputs.required' => 'The input fields are required.',
            'schema.outputs.required' => 'The output fields are required.',
            'config.required' => 'The configuration is required.',
        ];
    }

    /**
     * Configure additional validation after standard validation
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate complete schema using ToolValidator if present
            if ($this->has('schema')) {
                $toolValidator = app(ToolValidator::class);
                $schemaErrors = $toolValidator->validateToolSchema($this->input('schema'));
                
                if (!empty($schemaErrors)) {
                    foreach ($schemaErrors as $error) {
                        $validator->errors()->add('schema', $error);
                    }
                }
            }

            // Specific validation by tool type if type is being updated
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
     * Validate internal tool configuration
     */
    private function validateInternalConfig($validator): void
    {
        if (!$this->has('config')) {
            return; // If config is not being updated, do not validate
        }

        $config = $this->input('config', []);

        if (!isset($config['action'])) {
            $validator->errors()->add('config.action', 'The action is required for internal tools.');
        } elseif (!in_array($config['action'], ['create_ticket', 'transfer_department', 'send_message', 'close_conversation', 'assign_agent'])) {
            $validator->errors()->add('config.action', 'Invalid action for internal tool.');
        }
    }

    /**
     * Validate external tool configuration
     */
    private function validateExternalConfig($validator): void
    {
        if (!$this->has('config')) {
            return; // If config is not being updated, do not validate
        }

        $config = $this->input('config', []);

        // URL required
        if (!isset($config['url']) || empty($config['url'])) {
            $validator->errors()->add('config.url', 'The URL is required for external tools.');
        } elseif (!filter_var($config['url'], FILTER_VALIDATE_URL)) {
            $validator->errors()->add('config.url', 'The URL must be valid.');
        }

        // HTTP method required
        if (!isset($config['method']) || empty($config['method'])) {
            $validator->errors()->add('config.method', 'The HTTP method is required for external tools.');
        } elseif (!in_array(strtoupper($config['method']), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) {
            $validator->errors()->add('config.method', 'Invalid HTTP method.');
        }

        // Timeout optional but must be numeric
        if (isset($config['timeout']) && (!is_numeric($config['timeout']) || $config['timeout'] < 1)) {
            $validator->errors()->add('config.timeout', 'The timeout must be a number greater than 0.');
        }

        // Headers optional but must be array
        if (isset($config['headers']) && !is_array($config['headers'])) {
            $validator->errors()->add('config.headers', 'The headers must be an array.');
        }
    }
}
