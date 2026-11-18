<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        $incomes = $request->user()
            ->transactions()
            ->where('type', 'income')
            ->latest('transaction_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $totalIncome = $request->user()
            ->transactions()
            ->where('type', 'income')
            ->sum('amount');

        $thisMonthIncome = $request->user()
            ->transactions()
            ->where('type', 'income')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        return Inertia::render('Income/Index', [
            'incomes' => $incomes,
            'stats' => [
                'total' => (float) $totalIncome,
                'this_month' => (float) $thisMonthIncome,
            ],
        ]);
    }
}

