<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\DB;

class UpdateUserLoginStatus
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        $user->update([
            'status_connection' => true,
            'last_connection' => DB::raw('CURRENT_TIMESTAMP'),
        ]);
    }
}
