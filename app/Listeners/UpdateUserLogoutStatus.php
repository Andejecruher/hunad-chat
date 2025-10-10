<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;

class UpdateUserLogoutStatus
{
    public function handle(Logout $event): void
    {
        $user = $event->user;

        if ($user) {
            $user->update([
                'status_connection' => false,
            ]);
        }
    }
}
