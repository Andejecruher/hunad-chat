<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DepartmentHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed'
    ];

    protected $casts = [
        'is_closed' => 'boolean',
        'open_time' => 'datetime:H:i',
        'close_time' => 'datetime:H:i'
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    // Array de nombres de días
    public static function getDayNames(): array
    {
        return [
            0 => 'sunday',
            1 => 'monday',
            2 => 'tuesday',
            3 => 'wednesday',
            4 => 'thursday',
            5 => 'friday',
            6 => 'saturday'
        ];
    }

    public function getDayNameAttribute(): string
    {
        return self::getDayNames()[$this->day_of_week] ?? 'Desconocido';
    }

    // Método para formatear horario
    public function getFormattedHoursAttribute(): string
    {
        if ($this->is_closed) {
            return 'Cerrado';
        }

        return "{$this->open_time->format('H:i')} - {$this->close_time->format('H:i')}";
    }
}
