<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepartmentScheduleAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'change_type',
        'previous_data',
        'new_data',
        'changed_by',
    ];

    protected $casts = [
        'previous_data' => 'array',
        'new_data' => 'array',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
