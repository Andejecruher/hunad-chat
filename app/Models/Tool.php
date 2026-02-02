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
        'description',
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
        'created_at',
        'updated_at',
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

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }

    // ===========================
    // | Funciones útiles
    // ===========================
    public function isInternal(): bool
    {
        return $this->type === 'internal';
    }

    public function isExternal(): bool
    {
        return $this->type === 'external';
    }

    // Evitar loops de eventos: asignar atributos antes de persistir
    protected static function boot(): void
    {
        parent::boot();

        // Asignar timestamps y campos de auditoría antes de insertar
        static::creating(function ($tool) {
            $ts = \Illuminate\Support\Carbon::now()->utc()->toDateTimeString();
            $tool->created_at = $ts;
            $tool->updated_at = $ts;

            if (auth()->check()) {
                $tool->created_by = auth()->id();
                $tool->updated_by = auth()->id();
            }
        });

        // Actualizar updated_at y updated_by antes de guardar cambios
        static::updating(function ($tool) {
            $tool->updated_at = \Illuminate\Support\Carbon::now()->utc()->toDateTimeString();

            if (auth()->check()) {
                $tool->updated_by = auth()->id();
            }
        });
    }
}
