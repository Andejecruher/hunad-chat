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
 * Controller to handle WhatsApp Cloud API webhooks.
 *
 * Processes incoming WhatsApp events including messages, delivery statuses,
 * and template updates. Validates webhook signature and dispatches
 * jobs for asynchronous processing.
 */
class WhatsAppWebhookController extends Controller
{
    /**
     * Handle WhatsApp webhook verification.
     *
     * This endpoint is called by WhatsApp during webhook setup to verify
     * that the endpoint is valid.
     *
     * @param  Request  $request  Request with verification parameters
     * @return JsonResponse|string Challenge token or error
     */
    public function verify(Request $request): JsonResponse|Response|string
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
            // Validate webhook signature
            if (! $this->validateSignature($request)) {
                Log::warning('WhatsApp webhook signature validation failed', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json(['error' => 'Invalid signature'], Response::HTTP_FORBIDDEN);
            }

            $payload = $request->json()->all();

            // Log incoming event (without sensitive data)
            Log::info('WhatsApp webhook received', [
                'object' => $payload['object'] ?? null,
                'entries_count' => count($payload['entry'] ?? []),
                'ip' => $request->ip(),
            ]);

            // Verify this is a WhatsApp event
            if (($payload['object'] ?? null) !== 'whatsapp_business_account') {
                Log::warning('WhatsApp webhook: Invalid object type', ['object' => $payload['object'] ?? null]);

                return response()->json(['error' => 'Invalid object type'], Response::HTTP_BAD_REQUEST);
            }

            // Process each entry in the webhook
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
     * Process a single webhook entry.
     *
     * @param  array  $entry  Webhook entry data
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
     * Process message-related changes.
     *
     * @param  array  $value  Message change data
     */
    private function processMessageChanges(array $value): void
    {
        $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;

        if (! $phoneNumberId) {
            Log::warning('WhatsApp webhook: Missing whatsapp_phone_number_id in message change');

            return;
        }

        // Find the corresponding channel
        $channel = Channel::where('type', 'whatsapp')
            ->whereJsonContains('config->whatsapp_phone_number_id', $phoneNumberId)
            ->first();

        if (! $channel) {
            Log::warning('WhatsApp webhook: Channel not found', ['whatsapp_phone_number_id' => $phoneNumberId]);

            return;
        }

        Log::info('WhatsApp webhook: Processing messages for channel', ['channel_id' => $channel->id, 'message' => $value['messages'] ?? null, 'payload' => $value]);

        // Process incoming messages
        if (isset($value['messages'])) {
            foreach ($value['messages'] as $message) {
                ProcessIncomingWhatsAppMessage::dispatch($channel, $message, $value['contacts'] ?? []);
            }
        }

        // Process message statuses
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
     * Process template status updates.
     *
     * @param  array  $value  Template update data
     */
    private function processTemplateStatusUpdate(array $value): void
    {
        $templateName = $value['message_template_name'] ?? null;
        $status = $value['message_template_status'] ?? null;

        Log::info('WhatsApp template status update', [
            'template_name' => $templateName,
            'status' => $status,
        ]);

        // Optional: implement additional logic to handle
        // template status updates if needed
    }

    /**
     * Validate the webhook signature using the app secret.
     *
     * @param  Request  $request  Webhook request
     * @return bool True if the signature is valid
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

        // Remove the 'sha256=' prefix from the signature
        $signature = str_replace('sha256=', '', $signature);

        // Calcular la firma esperada
        $expectedSignature = hash_hmac('sha256', $request->getContent(), $appSecret);

        // Comparación segura contra ataques de timing
        return hash_equals($expectedSignature, $signature);
    }
}
