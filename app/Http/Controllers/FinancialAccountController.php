<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinancialAccountRequest;
use App\Models\FinancialAccount;
use App\Models\Currency;
use Inertia\Inertia;

class FinancialAccountController extends Controller
{
    /**
     * Show the list of financial accounts and the creation form.
     */
    public function index()
    {
        $accounts = FinancialAccount::with(['currency', 'workspace'])
            ->withSum('incomingTransactions as incoming_sum', 'amount')
            ->withSum('outgoingTransactions as outgoing_sum', 'amount')
            ->orderBy('name')
            ->get();
        $currencies = Currency::orderBy('code')->get(['id', 'code', 'name']);

        $workspaces = \App\Models\Workspace::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Accounts/Index', [
            'accounts'   => $accounts,
            'currencies' => $currencies,
            'workspaces' => $workspaces,
        ]);
    }

    /**
     * Store a new financial account.
     */
    public function store(StoreFinancialAccountRequest $request)
    {
        // Persist the new account
        FinancialAccount::create($request->validated());

        // Redirect back with a flash message
        return redirect()
            ->route('accounts.index')
            ->with('success', 'Account created successfully.');
    }

    /**
     * Delete an existing financial account.
     */
    public function destroy(FinancialAccount $account)
    {
        $account->delete();

        return redirect()
            ->route('accounts.index')
            ->with('success', 'Account deleted successfully.');
    }
}
