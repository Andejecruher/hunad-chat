<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    /** @use HasFactory<\Database\Factories\AgentFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'department_id', 'is_ai', 'config'];

    protected $casts = [
        'is_ai' => 'boolean',
        'config' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'assigned_agent_id');
    }
}
