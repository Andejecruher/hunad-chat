<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class DepartmentHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
        'uuid'
    ];

    protected $casts = [
        'is_closed' => 'boolean',
        'open_time' => 'datetime:H:i:s',
        'close_time' => 'datetime:H:i:s'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

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

    /**
     * Método para transformar a formato API requerido
     */
    public function toApiFormat(): array
    {
        return [
            'id' => $this->id,
            'open_time' => $this->open_time ? $this->open_time->format('H:i') : '09:00',
            'close_time' => $this->close_time ? $this->close_time->format('H:i') : '18:00'
        ];
    }
}
