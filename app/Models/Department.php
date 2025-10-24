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

    // Scope para departamentos activos
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Método para obtener horario de un día específico
    public function getHoursForDay(int $dayOfWeek): ?DepartmentHour
    {
        return $this->hours()->where('day_of_week', $dayOfWeek)->first();
    }
}
