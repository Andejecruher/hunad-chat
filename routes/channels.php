<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

/**
 * Here you may register all of the event broadcasting channels that your
 * application supports. The given channel authorization callbacks are
 * used to check if an authenticated user can listen to the channel.
 */
Broadcast::channel('company.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

Broadcast::channel('company.{company}.users', function ($user, $company) {
    // Solo permitir a usuarios que pertenezcan a la compañía
    return isset($user->company_id) && (int) $user->company_id === (int) $company;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::with('channel')->find($conversationId);

    if (! $conversation || ! $conversation->channel) {
        return false;
    }

    // Ensure the authenticated user belongs to the same company as the conversation's channel
    return isset($user->company_id) && (int) $conversation->channel->company_id === (int) $user->company_id;
});
