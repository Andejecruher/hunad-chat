<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAgent extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'context',
        'rules',
        'enabled',
    ];

    protected $casts = [
        'context' => 'array',
        'rules' => 'array',
        'enabled' => 'boolean',
    ];

    /* ===========================
     | Relaciones
     =========================== */

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function tools(): BelongsToMany
    {
        return $this->belongsToMany(
            Tool::class,
            'ai_agent_tool',
            'agent_id',
            'tool_id'
        )->withTimestamps();
    }

    public function toolExecutions(): HasMany
    {
        return $this->hasMany(ToolExecution::class);
    }

    /* ===========================
     | Scopes
     =========================== */

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }
}
