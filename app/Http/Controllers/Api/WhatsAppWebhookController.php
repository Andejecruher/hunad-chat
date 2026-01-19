<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\Channels\ProcessIncomingWhatsAppMessage;
use App\Models\Channel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Controlador para manejar webhooks de WhatsApp Cloud API.
 *
 * Procesa eventos entrantes de WhatsApp incluyendo mensajes, estados de entrega,
 * y actualizaciones de plantillas. Valida la firma del webhook y despacha
 * jobs para procesamiento asíncrono.
 */
class WhatsAppWebhookController extends Controller
{
    /**
     * Maneja la verificación del webhook de WhatsApp.
     *
     * Este endpoint es llamado por WhatsApp durante la configuración
     * del webhook para verificar que el endpoint es válido.
     *
     * @param  Request  $request  Petición con parámetros de verificación
     * @return JsonResponse|string Challenge token o error
     */
    public function verify(Request $request): JsonResponse|string
    {
        $verifyToken = config('services.meta.verify_token');

        if (! $verifyToken) {
            Log::error('WhatsApp webhook verification failed: VERIFY_TOKEN not configured');

            return response()->json(['error' => 'Webhook verification token not configured'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('WhatsApp webhook verified successfully');

            return response($challenge, Response::HTTP_OK)->header('Content-Type', 'text/plain');
        }

        Log::warning('WhatsApp webhook verification failed', [
            'mode' => $mode,
            'token_match' => $token === $verifyToken,
            'ip' => $request->ip(),
        ]);

        return response()->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
    }

    /**
     * Procesa los eventos entrantes de WhatsApp.
     *
     * Valida la firma del webhook, identifica el tipo de evento
     * y despacha el job apropiado para procesamiento asíncrono.
     *
     * @param  Request  $request  Petición con el payload del webhook
     * @return JsonResponse Confirmación de recepción
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        try {
            // Validar firma del webhook
            if (! $this->validateSignature($request)) {
                Log::warning('WhatsApp webhook signature validation failed', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json(['error' => 'Invalid signature'], Response::HTTP_FORBIDDEN);
            }

            $payload = $request->json()->all();

            // Log del evento entrante (sin datos sensibles)
            Log::info('WhatsApp webhook received', [
                'object' => $payload['object'] ?? null,
                'entries_count' => count($payload['entry'] ?? []),
                'ip' => $request->ip(),
            ]);

            // Verificar que es un evento de WhatsApp
            if (($payload['object'] ?? null) !== 'whatsapp_business_account') {
                Log::warning('WhatsApp webhook: Invalid object type', ['object' => $payload['object'] ?? null]);

                return response()->json(['error' => 'Invalid object type'], Response::HTTP_BAD_REQUEST);
            }

            // Procesar cada entrada del webhook
            foreach ($payload['entry'] ?? [] as $entry) {
                $this->processWebhookEntry($entry);
            }

            return response()->json(['status' => 'success'], Response::HTTP_OK);

        } catch (\Exception $e) {
            Log::error('WhatsApp webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip(),
            ]);

            // Siempre devolver 200 para evitar que WhatsApp reintente
            return response()->json(['status' => 'error'], Response::HTTP_OK);
        }
    }

    /**
     * Procesa una entrada individual del webhook.
     *
     * @param  array  $entry  Datos de la entrada del webhook
     */
    private function processWebhookEntry(array $entry): void
    {
        $changes = $entry['changes'] ?? [];

        foreach ($changes as $change) {
            $field = $change['field'] ?? null;
            $value = $change['value'] ?? [];

            match ($field) {
                'messages' => $this->processMessageChanges($value),
                'message_template_status_update' => $this->processTemplateStatusUpdate($value),
                default => Log::info('WhatsApp webhook: Unhandled field type', ['field' => $field])
            };
        }
    }

    /**
     * Procesa cambios relacionados con mensajes.
     *
     * @param  array  $value  Datos del cambio de mensaje
     */
    private function processMessageChanges(array $value): void
    {
        $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;

        if (! $phoneNumberId) {
            Log::warning('WhatsApp webhook: Missing phone_number_id in message change');

            return;
        }

        // Buscar el canal correspondiente
        $channel = Channel::where('type', 'whatsapp')
            ->whereJsonContains('config->phone_number_id', $phoneNumberId)
            ->first();

        if (! $channel) {
            Log::warning('WhatsApp webhook: Channel not found', ['phone_number_id' => $phoneNumberId]);

            return;
        }

        // Procesar mensajes entrantes
        if (isset($value['messages'])) {
            foreach ($value['messages'] as $message) {
                ProcessIncomingWhatsAppMessage::dispatch($channel, $message, $value['contacts'] ?? []);
            }
        }

        // Procesar estados de mensajes
        if (isset($value['statuses'])) {
            foreach ($value['statuses'] as $status) {
                $this->processMessageStatus($channel, $status);
            }
        }
    }

    /**
     * Procesa actualizaciones de estado de mensajes.
     *
     * @param  Channel  $channel  Canal de WhatsApp
     * @param  array  $status  Datos del estado del mensaje
     */
    private function processMessageStatus(Channel $channel, array $status): void
    {
        $messageId = $status['id'] ?? null;
        $statusType = $status['status'] ?? null;
        $timestamp = $status['timestamp'] ?? null;

        if (! $messageId || ! $statusType) {
            return;
        }

        // Buscar el mensaje en la base de datos y actualizar su estado
        $message = \App\Models\Message::where('external_id', $messageId)->first();

        if ($message) {
            $message->update([
                'status' => $statusType,
                'status_updated_at' => $timestamp ? \Carbon\Carbon::createFromTimestamp($timestamp) : now(),
            ]);

            Log::info('WhatsApp message status updated', [
                'message_id' => $messageId,
                'status' => $statusType,
                'channel_id' => $channel->id,
            ]);
        }
    }

    /**
     * Procesa actualizaciones de estado de plantillas.
     *
     * @param  array  $value  Datos de la actualización de plantilla
     */
    private function processTemplateStatusUpdate(array $value): void
    {
        $templateName = $value['message_template_name'] ?? null;
        $status = $value['message_template_status'] ?? null;

        Log::info('WhatsApp template status update', [
            'template_name' => $templateName,
            'status' => $status,
        ]);

        // Aquí puedes implementar lógica adicional para manejar
        // actualizaciones de estado de plantillas si es necesario
    }

    /**
     * Valida la firma del webhook usando el app secret.
     *
     * @param  Request  $request  Petición del webhook
     * @return bool True si la firma es válida
     */
    private function validateSignature(Request $request): bool
    {
        $appSecret = config('services.meta.app_secret');

        if (! $appSecret) {
            Log::error('WhatsApp webhook signature validation failed: APP_SECRET not configured');

            return false;
        }

        $signature = $request->header('X-Hub-Signature-256');

        if (! $signature) {
            return false;
        }

        // Remover el prefijo 'sha256=' de la firma
        $signature = str_replace('sha256=', '', $signature);

        // Calcular la firma esperada
        $expectedSignature = hash_hmac('sha256', $request->getContent(), $appSecret);

        // Comparación segura contra ataques de timing
        return hash_equals($expectedSignature, $signature);
    }
}
