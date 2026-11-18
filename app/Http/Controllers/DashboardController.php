<?php

namespace App\Http\Controllers;

use App\Models\FinancialAccount;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $userTransactions = $user->transactions();

        $today = now();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();

        // Financial accounts with computed dynamic balances
        $accounts = FinancialAccount::with(['currency', 'workspace'])
            ->withSum('incomingTransactions as incoming_sum', 'amount')
            ->withSum('outgoingTransactions as outgoing_sum', 'amount')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Total net worth across active accounts that are included in totals
        $totalBalance = (float) $accounts->where('include_in_totals', true)->sum('current_balance');

        // All-time income and expenses
        $totalIncome = (float) (clone $userTransactions)
            ->where('type', 'income')
            ->sum('amount');

        $totalExpenses = (float) (clone $userTransactions)
            ->where('type', 'expense')
            ->sum('amount');

        // Current month income and expenses
        $monthlyIncome = (float) (clone $userTransactions)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [
                $monthStart->toDateString(),
                $monthEnd->toDateString(),
            ])
            ->sum('amount');

        $monthlyExpenses = (float) (clone $userTransactions)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [
                $monthStart->toDateString(),
                $monthEnd->toDateString(),
            ])
            ->sum('amount');

        // Last six months of transactions for the chart
        $sixMonthsAgo = $today->copy()
            ->startOfMonth()
            ->subMonths(5);

        $chartTransactions = (clone $userTransactions)
            ->where('transaction_date', '>=', $sixMonthsAgo->toDateString())
            ->get(['type', 'amount', 'transaction_date']);

        $monthlyOverview = collect();

        for ($i = 5; $i >= 0; $i--) {
            $month = $today->copy()->startOfMonth()->subMonths($i);
            $monthKey = $month->format('Y-m');

            $monthTransactions = $chartTransactions->filter(
                fn ($transaction) =>
                    $transaction->transaction_date && $transaction->transaction_date->format('Y-m') === $monthKey
            );

            $monthlyOverview->push([
                'month' => $month->format('M'),
                'income' => (float) $monthTransactions
                    ->where('type', 'income')
                    ->sum('amount'),
                'expenses' => (float) $monthTransactions
                    ->where('type', 'expense')
                    ->sum('amount'),
            ]);
        }

        // Latest five transactions
        $recentTransactions = (clone $userTransactions)
            ->with(['currency', 'category', 'sourceAccount', 'destinationAccount'])
            ->latest('transaction_date')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(fn ($transaction) => [
                'id' => $transaction->id,
                'name' => $transaction->description ?: ($transaction->category?->name ?? 'Transaction'),
                'category' => $transaction->category?->name ?? '—',
                'account' => $transaction->type === 'income'
                    ? ($transaction->destinationAccount?->name ? 'To: ' . $transaction->destinationAccount->name : '—')
                    : ($transaction->sourceAccount?->name ? 'From: ' . $transaction->sourceAccount->name : '—'),
                'date' => $transaction->transaction_date ? $transaction->transaction_date->format('M d, Y') : '',
                'amount' => $transaction->amount,
                'currency' => $transaction->currency?->code ?? 'GHS',
                'type' => $transaction->type,
            ]);

        // Workspaces count
        $workspacesCount = Workspace::count();

        // Real active budgets with spending progress
        $activeBudgets = \App\Models\Budget::with(['currency', 'categories'])
            ->take(3)
            ->get()
            ->map(function ($b) {
                $spent = $b->getSpentAmount();
                $limit = (float) $b->amount;
                return [
                    'name' => $b->name,
                    'spent' => $spent,
                    'limit' => $limit,
                    'percentage' => $limit > 0 ? min(round(($spent / $limit) * 100), 100) : 0,
                    'currency' => $b->currency?->code ?? 'GHS',
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalBalance' => $totalBalance,
                'totalIncome' => $totalIncome,
                'totalExpenses' => $totalExpenses,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpenses' => $monthlyExpenses,
                'accountsCount' => $accounts->count(),
                'workspacesCount' => $workspacesCount,
            ],
            'accounts' => $accounts->take(4)->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'institution' => $account->institution,
                'currency' => $account->currency?->code ?? 'GHS',
                'balance' => $account->current_balance,
            ]),
            'monthlyOverview' => $monthlyOverview,
            'recentTransactions' => $recentTransactions,
            'budgets' => $activeBudgets,
        ]);
    }
}
