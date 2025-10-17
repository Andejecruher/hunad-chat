<?php

use Illuminate\Broadcasting\BroadcastController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Here you may register all of the event broadcasting channels that your
 * application supports. The given channel authorization callbacks are
 * used to check if an authenticated user can listen to the channel.
 */

Broadcast::channel('company.{company}.users', function ($user, $company) {
    // Solo permitir a usuarios que pertenezcan a la compañía
    return isset($user->company_id) && (int) $user->company_id === (int) $company;
});

