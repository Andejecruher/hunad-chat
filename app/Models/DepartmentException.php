<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class DepartmentException extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'name',
        'type',
        'start_date',
        'end_date',
        'recurrence_pattern',
        'behavior',
        'special_open_time',
        'special_close_time',
        'partial_hours'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'recurrence_pattern' => 'array',
        'partial_hours' => 'array',
        'special_open_time' => 'datetime:H:i',
        'special_close_time' => 'datetime:H:i'
    ];

    // Comportamientos disponibles
    const BEHAVIOR_FULLY_CLOSED = 'fully_closed';
    const BEHAVIOR_PARTIALLY_CLOSED = 'partially_closed';
    const BEHAVIOR_PARTIALLY_OPEN = 'partially_open';

    public static function getBehaviors(): array
    {
        return [
            self::BEHAVIOR_FULLY_CLOSED => 'Completamente Cerrado',
            self::BEHAVIOR_PARTIALLY_CLOSED => 'Parcialmente Cerrado',
            self::BEHAVIOR_PARTIALLY_OPEN => 'Parcialmente Abierto',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    // Métodos para recurrence_pattern mensual
    public function getMonthlyRecurrenceAttribute(): ?array
    {
        if ($this->type !== 'monthly') {
            return null;
        }

        return $this->recurrence_pattern;
    }

    public function setMonthlySpecificDay(int $dayOfMonth): void
    {
        $this->recurrence_pattern = [
            'type' => 'specific_day',
            'day_of_month' => $dayOfMonth
        ];
    }

    public function setMonthlyPattern(string $weekPattern, int $dayOfWeek): void
    {
        $this->recurrence_pattern = [
            'type' => 'pattern',
            'week_pattern' => $weekPattern,
            'day_of_week' => $dayOfWeek
        ];
    }

    // Método para obtener horarios efectivos
    public function getEffectiveHours(): ?array
    {
        return match($this->behavior) {
            self::BEHAVIOR_FULLY_CLOSED => null,
            self::BEHAVIOR_PARTIALLY_CLOSED => [
                ['open_time' => $this->special_open_time, 'close_time' => $this->special_close_time]
            ],
            self::BEHAVIOR_PARTIALLY_OPEN => $this->partial_hours,
            default => null
        };
    }

    // Método para verificar si aplica a una fecha
    public function appliesToDate(Carbon $date): bool
    {
        if ($date->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $date->gt($this->end_date)) {
            return false;
        }

        return $this->matchesRecurrencePattern($date);
    }

    private function matchesRecurrencePattern(Carbon $date): bool
    {
        return match($this->type) {
            'annual' => $this->matchesAnnualPattern($date),
            'monthly' => $this->matchesMonthlyPattern($date),
            'specific' => $this->matchesSpecificPattern($date),
            default => false
        };
    }

    private function matchesMonthlyPattern(Carbon $date): bool
    {
        $pattern = $this->recurrence_pattern;

        if (!$pattern) {
            return false;
        }

        if ($pattern['type'] === 'specific_day') {
            return $date->day == $pattern['day_of_month'];
        }

        // Para patrones como "primer lunes"
        $weekPattern = $pattern['week_pattern'];
        $targetDay = $pattern['day_of_week'];

        $firstOfMonth = $date->copy()->firstOfMonth();

        return match($weekPattern) {
            'first' => $date->isSameDay($firstOfMonth->copy()->modify("first {$this->getDayName($targetDay)} of this month")),
            'second' => $date->isSameDay($firstOfMonth->copy()->modify("second {$this->getDayName($targetDay)} of this month")),
            'third' => $date->isSameDay($firstOfMonth->copy()->modify("third {$this->getDayName($targetDay)} of this month")),
            'fourth' => $date->isSameDay($firstOfMonth->copy()->modify("fourth {$this->getDayName($targetDay)} of this month")),
            'last' => $date->isSameDay($firstOfMonth->copy()->modify("last {$this->getDayName($targetDay)} of this month")),
            default => false
        };
    }

    private function getDayName(int $dayOfWeek): string
    {
        return [
            0 => 'sunday',
            1 => 'monday',
            2 => 'tuesday',
            3 => 'wednesday',
            4 => 'thursday',
            5 => 'friday',
            6 => 'saturday'
        ][$dayOfWeek] ?? 'sunday';
    }

    private function matchesAnnualPattern(Carbon $date): bool
    {
        $pattern = $this->recurrence_pattern;
        return $pattern &&
            $date->month == $pattern['month'] &&
            $date->day == $pattern['day'];
    }

    private function matchesSpecificPattern(Carbon $date): bool
    {
        return $date->isSameDay($this->start_date);
    }
}
