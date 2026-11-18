<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    protected $fillable = ['name', 'type', 'is_active'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'workspace_user')
                    ->withPivot('role', 'status')
                    ->withTimestamps();
    }

    public function financialAccounts()
    {
        return $this->hasMany(FinancialAccount::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
}

