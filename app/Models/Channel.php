<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    /** @use HasFactory<\Database\Factories\ChannelFactory> */
    use HasFactory;

    protected $fillable = ['name', 'description', 'company_id', 'type', 'status', 'external_id', 'config'];

    protected $casts = [
        'config' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    // update created_at and updated_at on related conversations when the channel is created
    protected static function boot()
    {
        parent::boot();
        static::created(function ($channel) {
            $channel->conversations()->update(['created_at' => now(), 'updated_at' => now()]);
        });
        static::updated(function ($channel) {
            $channel->conversations()->update(['updated_at' => now()]);
        });
    }

}
