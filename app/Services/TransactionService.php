<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\FinancialAccount;
use App\Models\ExchangeRate;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    /**
     * Create a new transaction and update balances.
     *
     * @param array $data validated data from StoreTransactionRequest
     * @return Transaction
     * @throws ValidationException
     */
    public function create(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $this->assertBusinessRules($data);

            // Automatically resolve workspace_id from accounts if not explicitly provided
            if (empty($data['workspace_id'])) {
                if (!empty($data['destination_account_id'])) {
                    $data['workspace_id'] = FinancialAccount::find($data['destination_account_id'])?->workspace_id;
                } elseif (!empty($data['source_account_id'])) {
                    $data['workspace_id'] = FinancialAccount::find($data['source_account_id'])?->workspace_id;
                }
            }

            // Create the transaction record
            $transaction = Transaction::create($data);

            // Update balances according to type
            $this->applyBalanceChanges($transaction, $data);

            return $transaction;
        });
    }

    /**
     * Validate the business constraints that go beyond simple field validation.
     *
     * @throws ValidationException
     */
    protected function assertBusinessRules(array $data): void
    {
        // For transfers, source and destination must be different
        if ($data['type'] === 'transfer' && (int)$data['source_account_id'] === (int)$data['destination_account_id']) {
            throw ValidationException::withMessages([
                'destination_account_id' => ['Destination account must be different from source account.'],
            ]);
        }

        // Ensure both accounts belong to the same workspace (if both are present)
        if (!empty($data['source_account_id']) && !empty($data['destination_account_id'])) {
            $sourceWs = FinancialAccount::find($data['source_account_id'])?->workspace_id;
            $destWs   = FinancialAccount::find($data['destination_account_id'])?->workspace_id;

            if ($sourceWs && $destWs && (int)$sourceWs !== (int)$destWs) {
                throw ValidationException::withMessages([
                    'destination_account_id' => ['Both accounts must belong to the same workspace.'],
                ]);
            }
        }

        // Currency must match the source account (or destination for income/transfers)
        if ($data['type'] === 'income' && !empty($data['destination_account_id'])) {
            $account = FinancialAccount::with('currency')->find($data['destination_account_id']);
            if ($account && (int) $account->currency_id !== (int) $data['currency_id']) {
                $code = $account->currency?->code ?? 'selected';
                throw ValidationException::withMessages([
                    'currency_id' => ["Currency must match the destination account's currency ($code)."],
                ]);
            }
        }

        if ($data['type'] === 'expense' && !empty($data['source_account_id'])) {
            $account = FinancialAccount::with('currency')->find($data['source_account_id']);
            if ($account && (int) $account->currency_id !== (int) $data['currency_id']) {
                $code = $account->currency?->code ?? 'selected';
                throw ValidationException::withMessages([
                    'currency_id' => ["Currency must match the source account's currency ($code)."],
                ]);
            }
        }

        // For a cross-currency transfer we need an exchange rate
        if ($data['type'] === 'transfer' && !empty($data['destination_currency_id']) && (int)$data['currency_id'] !== (int)$data['destination_currency_id']) {
            $rate = ExchangeRate::where('from_currency_id', $data['currency_id'])
                ->where('to_currency_id', $data['destination_currency_id'])
                ->whereDate('date', now()->toDateString())
                ->first();

            if (!$rate) {
                throw ValidationException::withMessages([
                    'destination_currency_id' => ['Missing exchange rate for the selected currency pair today.'],
                ]);
            }

            // Store the rate ID for later reference
            $data['exchange_rate_id'] = $rate->id;
        }
    }

    /**
     * Apply balance changes to the involved accounts.
     */
    protected function applyBalanceChanges(Transaction $transaction, array $data): void
    {
        $amount = (float) $transaction->amount;
        $type = $transaction->type;

        // Income -> credit destination account
        if ($type === 'income' && !empty($transaction->destination_account_id)) {
            $dest = FinancialAccount::find($transaction->destination_account_id);
            if ($dest) {
                $dest->adjustBalance($amount);
            }
        }

        // Expense -> debit source account
        if ($type === 'expense' && !empty($transaction->source_account_id)) {
            $src = FinancialAccount::find($transaction->source_account_id);
            if ($src) {
                $src->adjustBalance($amount * -1);
            }
        }

        // Transfer -> move money from source to destination
        if ($type === 'transfer') {
            $src = !empty($transaction->source_account_id) ? FinancialAccount::find($transaction->source_account_id) : null;
            $dest = !empty($transaction->destination_account_id) ? FinancialAccount::find($transaction->destination_account_id) : null;

            if ($src) {
                $src->adjustBalance($amount * -1);
            }

            if ($dest) {
                $creditAmount = (float) ($data['destination_amount'] ?? $amount);
                $dest->adjustBalance($creditAmount);
            }
        }
    }
}
