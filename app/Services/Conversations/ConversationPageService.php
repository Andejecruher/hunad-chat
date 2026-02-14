<?php

namespace App\Services\Conversations;

use App\Models\Channel;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ConversationPageService
{
    /**
     * Build the props required by the conversations Inertia page.
     *
     * @return array<string, mixed>
     */
    public function buildPageProps(User $user, Request $request, ?Conversation $selectedConversation = null): array
    {
        $filters = $this->filtersFromRequest($request);
        $conversations = $this->conversationQuery($user->company_id, $filters)->get();
        $resolvedConversation = $this->resolveSelectedConversation($conversations, $selectedConversation, $request->query('conversation'));
        $messages = $resolvedConversation
            ? $this->messagesPaginator($resolvedConversation, (int) $request->integer('messages_limit', 30))
            : null;

        return [
            'conversations' => $conversations->map(fn (Conversation $conversation) => $this->mapConversation($conversation))->values(),
            'messages' => $messages?->through(fn (Message $message) => $this->mapMessage($message, $resolvedConversation)),
            'selectedConversationId' => $resolvedConversation ? (string) $resolvedConversation->id : null,
            'filters' => $filters,
            'channelLines' => $this->channelLines($user->company_id),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function filtersFromRequest(Request $request): array
    {
        return [
            'search' => (string) $request->string('search'),
            'channel' => (string) $request->string('channel'),
            'line' => (string) $request->string('line'),
        ];
    }

    /**
     * @param  array<string, string>  $filters
     */
    private function conversationQuery(int $companyId, array $filters): Builder
    {
        $query = Conversation::query()
            ->whereHas('channel', fn (Builder $builder) => $builder->where('company_id', $companyId))
            ->with([
                'channel:id,name,type,status,config',
                'customer:id,name,email,phone',
                'agent.user:id,name',
                'latestMessage',
                'ticket',
            ])
            ->withCount([
                'messages as unread_count' => fn (Builder $builder) => $builder
                    ->where('is_read', false)
                    ->where('sender_type', 'customer'),
            ])
            ->orderByDesc('updated_at');

        if ($filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $builder) use ($search) {
                $builder->whereHas('customer', fn (Builder $customerQuery) => $customerQuery
                    ->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('phone', 'like', $search)
                )
                    ->orWhereHas('messages', fn (Builder $messageQuery) => $messageQuery->where('content', 'like', $search));
            });
        }

        if ($filters['channel'] !== '' && $filters['channel'] !== 'all') {
            $query->whereHas('channel', fn (Builder $builder) => $builder->where('type', $filters['channel']));
        }

        if ($filters['line'] !== '' && $filters['line'] !== 'all') {
            $query->where('channel_id', $filters['line']);
        }

        return $query;
    }

    private function resolveSelectedConversation(Collection $conversations, ?Conversation $selectedConversation, ?string $requestedId): ?Conversation
    {
        if ($selectedConversation) {
            return $selectedConversation;
        }

        if ($requestedId) {
            $match = $conversations->firstWhere('id', (int) $requestedId);
            if ($match) {
                return $match;
            }
        }

        return $conversations->first();
    }

    private function messagesPaginator(Conversation $conversation, int $perPage): LengthAwarePaginator
    {
        return Message::query()
            ->where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->paginate($perPage, ['*'], 'messages_page')
            ->withQueryString();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapConversation(Conversation $conversation): array
    {
        $latestMessage = $conversation->latestMessage;
        $ticket = $conversation->ticket;

        return [
            'id' => (string) $conversation->id,
            'clientId' => $conversation->customer_id ? (string) $conversation->customer_id : '',
            'clientName' => $conversation->customer?->name ?? 'Cliente',
            'clientEmail' => $conversation->customer?->email,
            'clientPhone' => $conversation->customer?->phone,
            'clientAvatar' => null,
            'channelId' => (string) $conversation->channel_id,
            'channelLine' => $conversation->channel ? $this->mapChannelLine($conversation->channel) : null,
            'channel' => $conversation->channel?->type ?? 'whatsapp',
            'status' => $conversation->status,
            'lastMessage' => $latestMessage?->content ?? '',
            'lastMessageTime' => $latestMessage?->created_at?->diffForHumans() ?? '',
            'unreadCount' => (int) ($conversation->unread_count ?? 0),
            'assignedTo' => $conversation->agent?->user?->name,
            'assignedToAvatar' => null,
            'tags' => [],
            'ticket' => $ticket ? [
                'id' => (string) $ticket->id,
                'conversationId' => $ticket->conversation_id ? (string) $ticket->conversation_id : '',
                'subject' => 'Ticket #'.$ticket->id,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'assignedTo' => null,
                'createdAt' => $ticket->created_at?->toIso8601String(),
                'updatedAt' => $ticket->updated_at?->toIso8601String(),
            ] : null,
            'createdAt' => $conversation->created_at?->toIso8601String(),
            'updatedAt' => $conversation->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapMessage(Message $message, Conversation $conversation): array
    {
        $payload = $message->payload ?? [];
        $location = is_array($payload) ? ($payload['location'] ?? null) : null;
        $senderType = $this->mapSenderType($message->sender_type);

        return [
            'id' => (string) $message->id,
            'conversationId' => (string) $message->conversation_id,
            'content' => $message->content ?? '',
            'sender' => $senderType,
            'senderName' => $this->resolveSenderName($senderType, $conversation),
            'senderAvatar' => null,
            'timestamp' => $message->created_at?->toIso8601String() ?? null,
            'status' => $message->status ?? 'sent',
            'attachments' => $message->attachments ?? [],
            'reactions' => [],
            'location' => is_array($location) ? $location : null,
        ];
    }

    private function mapSenderType(string $senderType): string
    {
        return match ($senderType) {
            'customer' => 'client',
            'agent' => 'agent',
            'ai' => 'ai',
            default => 'agent',
        };
    }

    private function resolveSenderName(string $senderType, Conversation $conversation): string
    {
        if ($senderType === 'client') {
            return $conversation->customer?->name ?? 'Cliente';
        }

        if ($senderType === 'ai') {
            return 'IA Assistant';
        }

        return $conversation->agent?->user?->name ?? 'Agente';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function channelLines(int $companyId): array
    {
        return Channel::query()
            ->where('company_id', $companyId)
            ->get(['id', 'name', 'type', 'status', 'config'])
            ->map(fn (Channel $channel) => $this->mapChannelLine($channel))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapChannelLine(Channel $channel): array
    {
        $config = is_array($channel->config) ? $channel->config : [];
        $phoneNumber = $config['whatsapp_phone_number_id'] ?? $config['phone_number_id'] ?? null;

        return [
            'id' => (string) $channel->id,
            'name' => $channel->name,
            'channelType' => $channel->type,
            'phoneNumber' => $phoneNumber,
            'isActive' => $channel->status === 'active',
        ];
    }
}
