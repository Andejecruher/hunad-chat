<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'timezone',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    protected $appends = [
        'agents_count',
        'agents',
        'color'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hours(): HasMany
    {
        return $this->hasMany(DepartmentHour::class);
    }

    public function exceptions(): HasMany
    {
        return $this->hasMany(DepartmentException::class);
    }

    public function scheduleAudits(): HasMany
    {
        return $this->hasMany(DepartmentScheduleAudit::class);
    }

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class);
    }

    // Scope para departamentos activos
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope para filtrar por company del usuario autenticado
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // Atributos calculados
    public function getAgentsCountAttribute(): int
    {
        return $this->agents()->count();
    }

    public function getAgentsAttribute(): array
    {
        return $this->agents()->with('user:id,name,email')->get()->toArray();
    }

    public function getColorAttribute(): string
    {
        $colors = [
            'bg-brand-green',
            'bg-brand-teal',
            'bg-brand-gold',
            'bg-blue-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-orange-500',
            'bg-red-500',
            'bg-indigo-500',
            'bg-cyan-500'
        ];

        return $colors[$this->id % count($colors)];
    }

    // Método para obtener horario de un día específico
    public function getHoursForDay(int $dayOfWeek): ?DepartmentHour
    {
        return $this->hours()->where('day_of_week', $dayOfWeek)->first();
    }
}
