<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolExecution extends Model
{
    use HasFactory;

    protected $fillable = [
        'tool_id',
        'ai_agent_id',
        'payload',
        'status',
        'result',
        'error',
    ];

    protected $casts = [
        'payload' => 'array',
        'result' => 'array',
        'error' => 'array',
    ];

    /* ===========================
     | Relaciones
     =========================== */

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'ai_agent_id');
    }

    /* ===========================
     | Helpers de estado
     =========================== */

    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
