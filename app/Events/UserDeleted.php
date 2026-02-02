<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->dontBroadcastToCurrentUser();
    }

    public function broadcastOn()
    {
        return new PrivateChannel('company.'.$this->user->company_id.'.users');
    }

    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'deleted_at' => now()->toString(),
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.deleted';
    }
}
