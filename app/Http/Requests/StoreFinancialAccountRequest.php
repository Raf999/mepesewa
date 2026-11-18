<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinancialAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated user can create an account; adjust as needed.
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'workspace_id'          => 'required|exists:workspaces,id',
            'currency_id'           => 'required|exists:currencies,id',
            'name'                  => 'required|string|max:255',
            'type'                  => 'required|in:cash,bank,mobile_money,e_wallet,other',
            'opening_balance'       => 'required|numeric|min:0',
            'opening_balance_date'  => 'nullable|date',
            'institution'           => 'nullable|string|max:255',
            'masked_identifier'     => 'nullable|string|max:255',
            'is_active'             => 'required|boolean',
            'include_in_totals'     => 'required|boolean',
        ];
    }
}
