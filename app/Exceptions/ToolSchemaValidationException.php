<?php

namespace App\Exceptions;

use Exception;

class ToolSchemaValidationException extends Exception
{
    /**
     * Error por payload inválido
     */
    public static function invalidPayload(string $toolName, array $errors): self
    {
        $errorMessages = implode(', ', $errors);
        return new self("Invalid payload for tool '{$toolName}': {$errorMessages}");
    }

    /**
     * Error por schema malformado
     */
    public static function malformedSchema(string $toolName, string $reason): self
    {
        return new self("Tool '{$toolName}' has malformed schema: {$reason}");
    }

    /**
     * Error por campo requerido faltante
     */
    public static function missingRequiredField(string $toolName, string $field): self
    {
        return new self("Tool '{$toolName}' requires field '{$field}' but it was not provided");
    }

    /**
     * Error por tipo de campo incorrecto
     */
    public static function invalidFieldType(string $toolName, string $field, string $expectedType, string $actualType): self
    {
        return new self("Tool '{$toolName}' field '{$field}' expects {$expectedType} but got {$actualType}");
    }

    /**
     * Error por schema de salida inválido
     */
    public static function invalidOutputSchema(string $toolName, string $reason): self
    {
        return new self("Tool '{$toolName}' output doesn't match expected schema: {$reason}");
    }
}