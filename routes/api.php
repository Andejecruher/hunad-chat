<?php

declare(strict_types=1);

use App\Http\Controllers\Api\WhatsAppWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí puedes registrar las rutas de API para tu aplicación. Estas rutas
| son cargadas por el RouteServiceProvider dentro de un grupo que tiene
| el middleware "api" aplicado.
|
*/

// Rutas de webhook de WhatsApp (sin autenticación)
Route::prefix('webhooks')->group(function () {
    // GET para verificación del webhook
    Route::get('/whatsapp', [WhatsAppWebhookController::class, 'verify'])
        ->name('webhooks.whatsapp.verify');

    // POST para recibir eventos
    Route::post('/whatsapp', [WhatsAppWebhookController::class, 'handleWebhook'])
        ->name('webhooks.whatsapp');
});

// Rutas autenticadas de API
Route::middleware(['auth:sanctum'])->group(function () {

    // Información del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // === AI Tools API ===
    Route::prefix('ai/agents/{agent}')->group(function () {
        // Herramientas disponibles para un agente
        Route::get('tools', [App\Http\Controllers\AI\ToolController::class, 'index'])
            ->name('api.ai.agent.tools.index');

        Route::get('tools/stats', [App\Http\Controllers\AI\ToolController::class, 'stats'])
            ->name('api.ai.agent.tools.stats');

        Route::get('tools/category/{category}', [App\Http\Controllers\AI\ToolController::class, 'byCategory'])
            ->name('api.ai.agent.tools.category');

        Route::get('tools/{toolSlug}', [App\Http\Controllers\AI\ToolController::class, 'show'])
            ->name('api.ai.agent.tools.show');

        // Manifest MCP
        Route::get('mcp/manifest', [App\Http\Controllers\AI\ToolController::class, 'mcpManifest'])
            ->name('api.ai.agent.mcp.manifest');

        // Ejecución de herramientas
        Route::post('tools/{toolSlug}/execute', [App\Http\Controllers\AI\ToolExecutionController::class, 'execute'])
            ->name('api.ai.agent.tools.execute');

        // Gestión de ejecuciones
        Route::get('executions', [App\Http\Controllers\AI\ToolExecutionController::class, 'index'])
            ->name('api.ai.agent.executions.index');

        Route::get('executions/stats', [App\Http\Controllers\AI\ToolExecutionController::class, 'stats'])
            ->name('api.ai.agent.executions.stats');

        Route::get('executions/{execution}', [App\Http\Controllers\AI\ToolExecutionController::class, 'show'])
            ->name('api.ai.agent.executions.show');

        Route::delete('executions/{execution}', [App\Http\Controllers\AI\ToolExecutionController::class, 'cancel'])
            ->name('api.ai.agent.executions.cancel');

        Route::post('executions/{execution}/retry', [App\Http\Controllers\AI\ToolExecutionController::class, 'retry'])
            ->name('api.ai.agent.executions.retry');
    });

});

// Rutas de salud y métricas (sin autenticación)
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'services' => [
            'database' => 'up',
            'queue' => 'up',
            'cache' => 'up',
        ],
    ]);
})->name('api.health');
