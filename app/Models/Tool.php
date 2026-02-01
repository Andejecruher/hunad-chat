<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'category',
        'type',
        'schema',
        'config',
        'enabled',
        'last_executed_at',
        'last_error',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'schema' => 'array',
        'config' => 'array',
        'last_error' => 'array',
        'enabled' => 'boolean',
        'last_executed_at' => 'datetime',
    ];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /* ===========================
     | Relaciones
     =========================== */

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(
            AiAgent::class,
            'ai_agent_tool',
            'tool_id',
            'agent_id'
        )->withTimestamps();
    }

    public function executions(): HasMany
    {
        return $this->hasMany(ToolExecution::class);
    }

    /* ===========================
     | Scopes útiles
     =========================== */

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeInternal($query)
    {
        return $query->where('type', 'internal');
    }

    public function scopeExternal($query)
    {
        return $query->where('type', 'external');
    }
}
