<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'type', 'is_active'];

    public function budgets()
    {
        return $this->belongsToMany(Budget::class, 'budget_category')
            ->withTimestamps();
    }
}

