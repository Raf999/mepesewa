<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Assuming all authenticated users may create a transaction;
        // you can tighten this with policies later.
        return auth()->check();
    }

    public function rules(): array
    {
        // Base rules common to every type
        $rules = [
            'type'                => 'required|in:income,expense,transfer',
            'amount'              => 'required|numeric|min:0.01',
            'currency_id'         => 'required|exists:currencies,id',
            'description'         => 'nullable|string|max:255',
            'transaction_date'    => 'required|date',
        ];

        // Rules that depend on the transaction type
        if ($this->input('type') === 'income') {
            $rules['destination_account_id'] = 'required|exists:financial_accounts,id';
            $rules['source_account_id']      = 'nullable';
        } elseif ($this->input('type') === 'expense') {
            $rules['source_account_id']      = 'required|exists:financial_accounts,id';
            $rules['destination_account_id'] = 'nullable';
        } else { // transfer
            $rules['source_account_id']      = 'required|exists:financial_accounts,id';
            $rules['destination_account_id'] = 'required|exists:financial_accounts,id';
            // the two accounts must be different – we’ll enforce that in the service
        }

        // Category & payment method are optional but must exist if provided
        $rules['category_id']        = 'nullable|exists:categories,id';
        $rules['payment_method_id'] = 'nullable|exists:payment_methods,id';

        return $rules;
    }
}