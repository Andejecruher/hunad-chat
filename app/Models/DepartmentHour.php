<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepartmentHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
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
            6 => 'saturday',
        ];
    }

    /**
     * Handle open_time attribute with timezone conversion.
     * TODO: Review timezone logic for API compatibility
     */
    // protected function openTime(): Attribute
    // {
    //     return Attribute::make(
    //         get: function ($value) {
    //             if (empty($value)) {
    //                 return null;
    //             }

    //             $department = $this->department;
    //             $timezone = $department?->timezone ?? 'UTC';

    //             // Detect if value includes seconds or not
    //             $format = str_contains($value, ':') && strlen($value) === 5 ? 'H:i' : 'H:i:s';

    //             return Carbon::createFromFormat($format, $value, 'UTC')
    //                 ->setTimezone($timezone)
    //                 ->format('H:i');
    //         },
    //         set: function ($value) {
    //             if (empty($value)) {
    //                 return null;
    //             }

    //             $appTz = config('app.timezone', 'UTC');

    //             // Detect if value includes seconds
    //             $format = str_contains($value, ':') && strlen($value) === 5 ? 'H:i' : 'H:i:s';

    //             return Carbon::createFromFormat($format, $value, $appTz)
    //                 ->setTimezone('UTC')
    //                 ->format('H:i:s');
    //         }
    //     );
    // }

    /**
     * Handle close_time attribute with timezone conversion.
     * TODO: Review timezone logic for API compatibility
     */
    // protected function closeTime(): Attribute
    // {
    //     return Attribute::make(
    //         get: function ($value) {
    //             if (empty($value)) {
    //                 return null;
    //             }

    //             $department = $this->department;
    //             $timezone = $department?->timezone ?? 'UTC';
    //             $format = str_contains($value, ':') && strlen($value) === 5 ? 'H:i' : 'H:i:s';

    //             return Carbon::createFromFormat($format, $value, 'UTC')
    //                 ->setTimezone($timezone)
    //                 ->format('H:i');
    //         },
    //         set: function ($value) {
    //             if (empty($value)) {
    //                 return null;
    //             }

    //             $appTz = config('app.timezone', 'UTC');
    //             $format = str_contains($value, ':') && strlen($value) === 5 ? 'H:i' : 'H:i:s';

    //             return Carbon::createFromFormat($format, $value, $appTz)
    //                 ->setTimezone('UTC')
    //                 ->format('H:i:s');
    //         }
    //     );
    // }

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
            'close_time' => $this->close_time ? $this->close_time->format('H:i') : '18:00',
        ];
    }
}
