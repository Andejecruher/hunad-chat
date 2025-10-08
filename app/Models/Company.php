<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    /** @use HasFactory<\Database\Factories\CompanyFactory> */
    use HasFactory;

    protected $fillable = ['name', 'slug', 'subscription_type', 'branding'];

    protected $casts = [
        'branding' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function channels()
    {
        return $this->hasMany(Channel::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function tools()
    {
        return $this->hasMany(Tool::class);
    }
}
