<?php

namespace App\Http\Requests\Tool;

use App\Services\AI\ToolValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
            'name' => 'required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|required|in:internal,external',
            'description' => 'nullable|string|max:1000',
            'schema' => 'sometimes|required|string|json',
            'config' => 'sometimes|required|string|json',
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
            'schema.json' => 'The schema must be valid JSON.',
            'config.required' => 'The configuration is required.',
            'config.json' => 'The configuration must be valid JSON.',
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
                $schema = $this->input('schema');

                // Convert JSON string to array if needed
                if (is_string($schema)) {
                    $schema = json_decode($schema, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $validator->errors()->add('schema', 'El schema debe ser un JSON válido.');

                        return;
                    }
                }

                $schemaErrors = $toolValidator->validateToolSchema($schema);

                if (! empty($schemaErrors)) {
                    foreach ($schemaErrors as $error) {
                        $validator->errors()->add('schema', $error);
                    }
                    Log::debug('Tool schema validation errors', ['errors' => $schemaErrors]);
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
            // Log any validation errors after custom checks
            if ($validator->errors()->any()) {
                Log::debug('UpdateToolRequest validation errors', ['errors' => $validator->errors()->all()]);
            }
        });
    }

    /**
     * Validate internal tool configuration
     */
    private function validateInternalConfig($validator): void
    {
        if (! $this->has('config')) {
            return; // If config is not being updated, do not validate
        }

        $config = $this->input('config', []);

        // Convert JSON string to array if needed
        if (is_string($config)) {
            $config = json_decode($config, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $validator->errors()->add('config', 'El config debe ser un JSON válido.');

                return;
            }
        }

        // If action is provided, validate it; do not require it on update to keep updates flexible
        if (isset($config['action'])) {
            if (! in_array($config['action'], ['create_ticket', 'transfer_department', 'send_message', 'close_conversation', 'assign_agent'])) {
                $validator->errors()->add('config.action', 'Invalid action for internal tool.');
            }
        }
    }

    /**
     * Validate external tool configuration
     */
    private function validateExternalConfig($validator): void
    {
        if (! $this->has('config')) {
            return; // If config is not being updated, do not validate
        }

        $config = $this->input('config', []);

        // Convert JSON string to array if needed
        if (is_string($config)) {
            $config = json_decode($config, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $validator->errors()->add('config', 'El config debe ser un JSON válido.');

                return;
            }
        }

        // If URL is provided, validate it (do not require on update)
        if (isset($config['url'])) {
            if (empty($config['url']) || ! filter_var($config['url'], FILTER_VALIDATE_URL)) {
                $validator->errors()->add('config.url', 'The URL must be valid.');
            }
        }

        // If method is provided, validate it
        if (isset($config['method'])) {
            if (! in_array(strtoupper($config['method']), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) {
                $validator->errors()->add('config.method', 'Invalid HTTP method.');
            }
        }

        // Timeout optional but must be numeric
        if (isset($config['timeout']) && (! is_numeric($config['timeout']) || $config['timeout'] < 1)) {
            $validator->errors()->add('config.timeout', 'The timeout must be a number greater than 0.');
        }

        // Headers optional but must be array
        if (isset($config['headers']) && ! is_array($config['headers'])) {
            $validator->errors()->add('config.headers', 'The headers must be an array.');
        }
    }
}
