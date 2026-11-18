<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'currency_id',
        'name',
        'amount',
        'period',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'budget_category')
            ->withTimestamps();
    }

    /**
     * Compute the current spent amount against this budget.
     */
    public function getSpentAmount(): float
    {
        $query = Transaction::query()
            ->where('workspace_id', $this->workspace_id)
            ->where('type', 'expense');

        $categoryIds = $this->categories->pluck('id')->toArray();
        if (!empty($categoryIds)) {
            $query->whereIn('category_id', $categoryIds);
        }

        // Period-based date filter
        if ($this->period === 'monthly') {
            $query->whereMonth('transaction_date', now()->month)
                  ->whereYear('transaction_date', now()->year);
        } elseif ($this->period === 'weekly') {
            $query->whereBetween('transaction_date', [
                now()->startOfWeek()->toDateString(),
                now()->endOfWeek()->toDateString(),
            ]);
        } elseif ($this->period === 'yearly') {
            $query->whereYear('transaction_date', now()->year);
        } elseif ($this->period === 'custom' && $this->start_date && $this->end_date) {
            $query->whereBetween('transaction_date', [
                $this->start_date->toDateString(),
                $this->end_date->toDateString(),
            ]);
        }

        return (float) $query->sum('amount');
    }
}
