<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialAccount extends Model
{
    protected $fillable = [
        'workspace_id',
        'currency_id',
        'name',
        'type',
        'opening_balance',
        'opening_balance_date',
        'institution',
        'masked_identifier',
        'is_active',
        'include_in_totals',
    ];

    protected $appends = ['current_balance'];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function incomingTransactions()
    {
        return $this->hasMany(Transaction::class, 'destination_account_id');
    }

    public function outgoingTransactions()
    {
        return $this->hasMany(Transaction::class, 'source_account_id');
    }

    public function getCurrentBalanceAttribute(): float
    {
        if (array_key_exists('incoming_sum', $this->attributes) && array_key_exists('outgoing_sum', $this->attributes)) {
            return round((float) $this->opening_balance + (float) ($this->attributes['incoming_sum'] ?? 0) - (float) ($this->attributes['outgoing_sum'] ?? 0), 2);
        }

        $inflow = (float) $this->incomingTransactions()->sum('amount');
        $outflow = (float) $this->outgoingTransactions()->sum('amount');

        return round((float) $this->opening_balance + $inflow - $outflow, 2);
    }

    public function adjustBalance(float $delta): void
    {
        // Balances are computed dynamically from opening_balance and posted transactions.
    }
}
