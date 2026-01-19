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
