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
        'color',
        'description',
        'timezone',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    protected $appends = [
        'agents_count'
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


    // Método para obtener horario de un día específico
    public function getHoursForDay(int $dayOfWeek): ?DepartmentHour
    {
        return $this->hours()->where('day_of_week', $dayOfWeek)->first();
    }

    /**
     * Método para obtener todos los horarios en formato API
     */
    public function getFormattedHours(): array
    {
        $formattedHours = [];

        // Crear array para todos los días de la semana (0-6)
        for ($day = 0; $day <= 6; $day++) {
            $dayHours = $this->hours()->where('day_of_week', $day)->get();

            if ($dayHours->isNotEmpty()) {
                $timeRanges = $dayHours->map(function ($hour) {
                    return $hour->toApiFormat();
                })->toArray();

                $formattedHours[] = [
                    'day_of_week' => $day,
                    'time_ranges' => $timeRanges,
                    'is_closed' => $dayHours->first()->is_closed
                ];
            } else {
                // Crear horario por defecto si no existe
                $formattedHours[] = [
                    'day_of_week' => $day,
                    'time_ranges' => [
                        [
                            'id' => (string) \Illuminate\Support\Str::uuid(),
                            'open_time' => '09:00',
                            'close_time' => '18:00'
                        ]
                    ],
                    'is_closed' => in_array($day, [0, 6]) // Cerrado sábados y domingos por defecto
                ];
            }
        }

        return $formattedHours;
    }
}
