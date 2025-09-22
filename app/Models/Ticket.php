<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory;

    protected $fillable = ['company_id', 'department_id', 'conversation_id', 'status', 'priority'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
