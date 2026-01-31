<?php

namespace App\Jobs;

use App\Models\ToolExecution;
use App\Services\AI\Executors\ExternalToolExecutor;
use App\Services\AI\Executors\InternalToolExecutor;
use App\Services\AI\ToolValidator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job para ejecutar herramientas de IA de forma asíncrona
 * 
 * Se encarga de:
 * - Ejecutar la herramienta según su tipo (internal/external)
 * - Actualizar el registro de ejecución con el resultado
 * - Manejar errores y actualizaciones de estado
 * - Registrar métricas de ejecución
 */
class ExecuteToolJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número de reintentos del job
     * 
     * @var int
     */
    public $tries = 3;

    /**
     * Timeout en segundos
     * 
     * @var int
     */
    public $timeout = 120;

    /**
     * Crear nueva instancia del job
     * 
     * @param ToolExecution $execution
     */
    public function __construct(
        public ToolExecution $execution
    ) {
        // Configurar cola específica según el tipo de herramienta
        $tool = $execution->tool;
        $this->onQueue($tool->type === 'external' ? 'external-tools' : 'internal-tools');
    }

    /**
     * Ejecutar el job
     */
    public function handle(): void
    {
        $execution = $this->execution;
        $tool = $execution->tool;

        Log::info('Starting tool execution job', [
            'execution_id' => $execution->id,
            'tool_slug' => $tool->slug,
            'tool_type' => $tool->type,
            'attempt' => $this->attempts(),
        ]);

        try {
            // Verificar que la ejecución esté en estado válido
            if ($execution->status !== 'accepted') {
                Log::warning('Tool execution not in accepted state', [
                    'execution_id' => $execution->id,
                    'current_status' => $execution->status,
                ]);
                return;
            }

            // Marcar como en progreso
            $execution->update(['status' => 'running']);

            // Ejecutar según el tipo de herramienta
            $result = match ($tool->type) {
                'internal' => app(InternalToolExecutor::class)->execute($execution),
                'external' => app(ExternalToolExecutor::class)->execute($execution),
                default => throw new \InvalidArgumentException("Unknown tool type: {$tool->type}"),
            };

            // Validar resultado contra schema de salida
            app(ToolValidator::class)->validateResult($tool, $result);

            // Actualizar ejecución como exitosa
            $execution->update([
                'status' => 'success',
                'result' => $result,
                'error' => null,
            ]);

            // Actualizar timestamp de última ejecución en la herramienta
            $tool->update([
                'last_executed_at' => now(),
                'last_error' => null,
            ]);

            Log::info('Tool execution completed successfully', [
                'execution_id' => $execution->id,
                'tool_slug' => $tool->slug,
                'execution_time' => $this->getExecutionTime(),
            ]);

        } catch (\Exception $e) {
            $this->handleExecutionFailure($execution, $tool, $e);
        }
    }

    /**
     * Manejar fallo en la ejecución
     * 
     * @param ToolExecution $execution
     * @param \App\Models\Tool $tool
     * @param \Exception $e
     */
    private function handleExecutionFailure(ToolExecution $execution, $tool, \Exception $e): void
    {
        $errorInfo = [
            'message' => $e->getMessage(),
            'type' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'attempt' => $this->attempts(),
            'max_attempts' => $this->tries,
        ];

        Log::error('Tool execution failed', [
            'execution_id' => $execution->id,
            'tool_slug' => $tool->slug,
            'error' => $errorInfo,
        ]);

        // Actualizar ejecución como fallida
        $execution->update([
            'status' => 'failed',
            'result' => null,
            'error' => $errorInfo,
        ]);

        // Actualizar error en la herramienta si es el último intento
        if ($this->attempts() >= $this->tries) {
            $tool->update([
                'last_error' => $errorInfo,
            ]);
        }

        // Si no hemos agotado los reintentos, relanzar la excepción para que el job se reintente
        if ($this->attempts() < $this->tries) {
            throw $e;
        }
    }

    /**
     * Obtener tiempo de ejecución desde que se creó el registro
     * 
     * @return int Tiempo en milisegundos
     */
    private function getExecutionTime(): int
    {
        return now()->diffInMilliseconds($this->execution->created_at);
    }

    /**
     * Manejar job fallido definitivamente
     * 
     * @param \Throwable $exception
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical('Tool execution job failed permanently', [
            'execution_id' => $this->execution->id,
            'tool_slug' => $this->execution->tool->slug,
            'attempts' => $this->attempts(),
            'error' => $exception->getMessage(),
        ]);

        // Marcar como fallido definitivamente
        $this->execution->update([
            'status' => 'failed',
            'error' => [
                'message' => 'Job failed after maximum attempts',
                'original_error' => $exception->getMessage(),
                'attempts' => $this->attempts(),
                'failed_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Configurar tags para mejor monitoreo
     * 
     * @return array
     */
    public function tags(): array
    {
        $tool = $this->execution->tool;
        
        return [
            'tool_type:' . $tool->type,
            'tool_category:' . $tool->category,
            'company_id:' . $tool->company_id,
            'execution_id:' . $this->execution->id,
        ];
    }

    /**
     * Obtener identificador único para el job
     * 
     * @return string
     */
    public function uniqueId(): string
    {
        return "execute_tool_{$this->execution->id}";
    }

    /**
     * Determinar si el job debería ser único
     * 
     * @return bool
     */
    public function shouldBeUnique(): bool
    {
        return true; // Evitar ejecutar la misma herramienta múltiples veces simultáneamente
    }

    /**
     * Tiempo de expiración de la unicidad en segundos
     * 
     * @return int
     */
    public function uniqueFor(): int
    {
        return 300; // 5 minutos
    }
}