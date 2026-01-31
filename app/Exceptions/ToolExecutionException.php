<?php

namespace App\Exceptions;

use Exception;

class ToolExecutionException extends Exception
{
    /**
     * Crear excepción por herramienta no encontrada
     */
    public static function toolNotFound(string $toolId): self
    {
        return new self("Tool with ID {$toolId} not found or not accessible");
    }

    /**
     * Crear excepción por herramienta deshabilitada
     */
    public static function toolDisabled(string $toolName): self
    {
        return new self("Tool '{$toolName}' is currently disabled");
    }

    /**
     * Crear excepción por agente sin acceso a la herramienta
     */
    public static function agentNotAuthorized(string $agentId, string $toolName): self
    {
        return new self("Agent {$agentId} is not authorized to execute tool '{$toolName}'");
    }

    /**
     * Crear excepción por error de ejecución externa
     */
    public static function externalExecutionFailed(string $toolName, string $reason): self
    {
        return new self("External tool '{$toolName}' execution failed: {$reason}");
    }

    /**
     * Crear excepción por timeout en ejecución externa
     */
    public static function executionTimeout(string $toolName, int $timeout): self
    {
        return new self("Tool '{$toolName}' execution timed out after {$timeout} seconds");
    }

    /**
     * Crear excepción por error interno
     */
    public static function internalExecutionFailed(string $toolName, string $reason): self
    {
        return new self("Internal tool '{$toolName}' execution failed: {$reason}");
    }
}