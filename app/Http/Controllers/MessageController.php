<?php

namespace App\Http\Controllers;

use App\Http\Requests\Conversation\StoreMessageRequest;
use App\Jobs\Channels\SendWhatsAppMessageJob;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\Conversations\ConversationPageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Log;

class MessageController extends Controller
{
    public function __construct(private ConversationPageService $pageService) {}

    public function index(Request $request, Conversation $conversation): Response
    {
        $this->ensureCompanyAccess($request, $conversation);

        return Inertia::render('conversations/index', $this->pageService->buildPageProps(
            $request->user(),
            $request,
            $conversation
        ));
    }

    public function store(StoreMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        Log::info('Storing message for conversation', ['conversation_id' => $conversation->id]);

        $this->ensureCompanyAccess($request, $conversation);

        $attachments = $this->storeAttachments($request);
        $payload = $this->buildPayload($request);
        $content = (string) ($request->input('content') ?? '');

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'agent',
            'type' => $this->resolveMessageType($attachments, $content),
            'content' => $content,
            'attachments' => $attachments,
            'payload' => $payload,
            'is_read' => false,
            'status' => 'pending',
        ]);

        // Dispatch channel-specific jobs (WhatsApp for now)
        try {
            $conversation->loadMissing('channel');

            if ($conversation->channel && ($conversation->channel->type ?? null) === 'whatsapp') {
                SendWhatsAppMessageJob::dispatch($message);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch send message job', [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Mensaje enviado.');
    }

    private function ensureCompanyAccess(Request $request, Conversation $conversation): void
    {
        $user = $request->user();

        $conversation->loadMissing('channel');

        if (! $user || ! $conversation->channel || $conversation->channel->company_id !== $user->company_id) {
            abort(403, 'Unauthorized.');
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function storeAttachments(StoreMessageRequest $request): array
    {
        if (! $request->hasFile('attachments')) {
            return [];
        }

        $stored = [];

        foreach ($request->file('attachments', []) as $file) {
            $path = $file->store('messages', 'public');
            $stored[] = [
                'id' => Str::uuid()->toString(),
                'type' => $this->resolveAttachmentType($file->getMimeType()),
                'url' => Storage::disk('public')->url($path),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mimeType' => $file->getMimeType(),
            ];
        }

        return $stored;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function buildPayload(StoreMessageRequest $request): ?array
    {
        $location = $request->input('location');

        if (! is_array($location)) {
            return null;
        }

        return ['location' => $location];
    }

    /**
     * @param  array<int, array<string, mixed>>  $attachments
     */
    private function resolveMessageType(array $attachments, string $content): string
    {
        if ($content !== '' && empty($attachments)) {
            return 'text';
        }

        if (! empty($attachments)) {
            $first = $attachments[0]['type'] ?? null;

            return in_array($first, ['image', 'video', 'audio'], true) ? $first : 'file';
        }

        return 'text';
    }

    private function resolveAttachmentType(?string $mimeType): string
    {
        if (! $mimeType) {
            return 'document';
        }

        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        return 'document';
    }
}
