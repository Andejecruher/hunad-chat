<?php

namespace App\Services\AI;

use App\Exceptions\ToolSchemaValidationException;
use App\Models\Tool;

/**
 * Validador de schemas y payloads para herramientas
 * 
 * Se encarga de:
 * - Validar que el payload cumple con el schema de entrada
 * - Validar que el resultado cumple con el schema de salida
 * - Proporcionar errores descriptivos
 */
class ToolValidator
{
    /**
     * Validar payload contra schema de entrada
     * 
     * @param Tool $tool
     * @param array $payload
     * @throws ToolSchemaValidationException
     */
    public function validatePayload(Tool $tool, array $payload): void
    {
        $inputSchema = $tool->schema['inputs'] ?? [];
        
        if (empty($inputSchema)) {
            return; // No hay schema definido, permitir cualquier payload
        }

        $errors = [];

        // Validar campos requeridos
        foreach ($inputSchema as $field) {
            $fieldName = $field['name'];
            $required = $field['required'] ?? false;
            $expectedType = $field['type'];

            if ($required && !array_key_exists($fieldName, $payload)) {
                $errors[] = "Missing required field: {$fieldName}";
                continue;
            }

            if (array_key_exists($fieldName, $payload)) {
                $actualValue = $payload[$fieldName];
                
                if (!$this->validateFieldType($actualValue, $expectedType)) {
                    $actualType = gettype($actualValue);
                    $errors[] = "Field {$fieldName} expects {$expectedType} but got {$actualType}";
                }
            }
        }

        // Verificar campos no permitidos (opcional, más estricto)
        $allowedFields = array_column($inputSchema, 'name');
        $extraFields = array_diff(array_keys($payload), $allowedFields);
        if (!empty($extraFields)) {
            $errors[] = "Unexpected fields: " . implode(', ', $extraFields);
        }

        if (!empty($errors)) {
            throw ToolSchemaValidationException::invalidPayload($tool->name, $errors);
        }
    }

    /**
     * Validar resultado contra schema de salida
     * 
     * @param Tool $tool
     * @param array $result
     * @throws ToolSchemaValidationException
     */
    public function validateResult(Tool $tool, array $result): void
    {
        $outputSchema = $tool->schema['outputs'] ?? [];
        
        if (empty($outputSchema)) {
            return; // No hay schema definido
        }

        $errors = [];

        foreach ($outputSchema as $field) {
            $fieldName = $field['name'];
            $required = $field['required'] ?? false;
            $expectedType = $field['type'];

            if ($required && !array_key_exists($fieldName, $result)) {
                $errors[] = "Missing required output field: {$fieldName}";
                continue;
            }

            if (array_key_exists($fieldName, $result)) {
                $actualValue = $result[$fieldName];
                
                if (!$this->validateFieldType($actualValue, $expectedType)) {
                    $actualType = gettype($actualValue);
                    $errors[] = "Output field {$fieldName} expects {$expectedType} but got {$actualType}";
                }
            }
        }

        if (!empty($errors)) {
            throw ToolSchemaValidationException::invalidOutputSchema($tool->name, implode(', ', $errors));
        }
    }

    /**
     * Validar tipo de campo
     * 
     * @param mixed $value
     * @param string $expectedType
     * @return bool
     */
    private function validateFieldType($value, string $expectedType): bool
    {
        return match ($expectedType) {
            'string' => is_string($value),
            'number' => is_numeric($value),
            'integer' => is_int($value),
            'boolean' => is_bool($value),
            'array' => is_array($value),
            'object' => is_array($value) || is_object($value),
            default => true, // Tipo no reconocido, permitir cualquier valor
        };
    }

    /**
     * Validar que el schema de una herramienta esté bien formado
     * 
     * @param array $schema
     * @return array Array de errores, vacío si es válido
     */
    public function validateToolSchema(array $schema): array
    {
        $errors = [];

        // Validar estructura básica
        if (!isset($schema['inputs']) || !is_array($schema['inputs'])) {
            $errors[] = "Schema must have 'inputs' array";
        }

        if (!isset($schema['outputs']) || !is_array($schema['outputs'])) {
            $errors[] = "Schema must have 'outputs' array";
        }

        // Validar campos de entrada
        if (isset($schema['inputs'])) {
            foreach ($schema['inputs'] as $index => $input) {
                $fieldErrors = $this->validateSchemaField($input, "inputs[{$index}]");
                $errors = array_merge($errors, $fieldErrors);
            }
        }

        // Validar campos de salida
        if (isset($schema['outputs'])) {
            foreach ($schema['outputs'] as $index => $output) {
                $fieldErrors = $this->validateSchemaField($output, "outputs[{$index}]");
                $errors = array_merge($errors, $fieldErrors);
            }
        }

        return $errors;
    }

    /**
     * Validar un campo individual del schema
     * 
     * @param array $field
     * @param string $context
     * @return array
     */
    private function validateSchemaField(array $field, string $context): array
    {
        $errors = [];
        $allowedTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];

        if (!isset($field['name']) || !is_string($field['name']) || empty($field['name'])) {
            $errors[] = "{$context} must have a non-empty 'name' string";
        }

        if (!isset($field['type']) || !in_array($field['type'], $allowedTypes)) {
            $errors[] = "{$context} must have a valid 'type' (" . implode(', ', $allowedTypes) . ")";
        }

        if (isset($field['required']) && !is_bool($field['required'])) {
            $errors[] = "{$context} 'required' must be boolean";
        }

        if (isset($field['description']) && !is_string($field['description'])) {
            $errors[] = "{$context} 'description' must be string";
        }

        return $errors;
    }
}