<?php
namespace App\Http\Controllers;

// app/Http/Controllers/TransactionController.php
use App\Http\Requests\StoreTransactionRequest;
use App\Services\TransactionService;

use App\Models\FinancialAccount;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Currency;
use Inertia\Inertia;
use App\Models\Workspace;


class TransactionController extends Controller
{
    protected $service;

    public function __construct(TransactionService $service)
    {
        $this->service = $service;
    }

    /**
     * Show the transaction list and creation page.
     */
    public function index()
    {
        $transactions = \App\Models\Transaction::orderByDesc('created_at')
            ->with(['user', 'currency', 'category', 'sourceAccount', 'destinationAccount'])
            ->paginate(15)
            ->toArray();

        $workspaces     = Workspace::orderBy('name')->get(['id', 'name']);
        $accounts       = FinancialAccount::with('currency')->where('is_active', true)->orderBy('name')->get(['id', 'workspace_id', 'name', 'currency_id']);
        $categories     = Category::where('is_active', true)->orderBy('name')->get(['id', 'workspace_id', 'name', 'type']);
        $paymentMethods = PaymentMethod::orderBy('name')->get(['id', 'name']);
        $currencies     = Currency::orderBy('code')->get(['id', 'code', 'name']);

        return Inertia::render('Transactions/Index', [
            'transactions'    => $transactions,
            'workspaces'      => $workspaces,
            'accounts'        => $accounts,
            'categories'      => $categories,
            'paymentMethods'  => $paymentMethods,
            'currencies'      => $currencies,
        ]);
    }

    public function store(StoreTransactionRequest $request)
    {
        $data = $request->validated();
        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        }

        $transaction = $this->service->create($data);

        return redirect()
            ->route('transactions.index')
            ->with('success', 'Transaction recorded successfully.');

    }

    /**
     * Delete a transaction.
     */
    public function destroy(\App\Models\Transaction $transaction)
    {
        $transaction->delete();

        return redirect()
            ->route('transactions.index')
            ->with('success', 'Transaction deleted successfully.');
    }
}
