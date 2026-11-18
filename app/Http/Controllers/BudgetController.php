<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    /**
     * Display a listing of budgets with real-time spending progress.
     */
    public function index(): Response
    {
        $budgets = Budget::with(['workspace', 'currency', 'categories'])
            ->orderBy('name')
            ->get()
            ->map(function ($budget) {
                $spent = $budget->getSpentAmount();
                $limit = (float) $budget->amount;
                $remaining = max(0, $limit - $spent);
                $percentage = $limit > 0 ? round(($spent / $limit) * 100) : 0;

                return [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'amount' => $limit,
                    'spent' => $spent,
                    'remaining' => $remaining,
                    'percentage' => $percentage,
                    'is_over_budget' => $spent > $limit,
                    'currency' => $budget->currency?->code ?? 'GHS',
                    'period' => $budget->period,
                    'start_date' => $budget->start_date ? $budget->start_date->format('Y-m-d') : null,
                    'end_date' => $budget->end_date ? $budget->end_date->format('Y-m-d') : null,
                    'workspace' => $budget->workspace?->name,
                    'categories' => $budget->categories->map(fn ($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                    ]),
                ];
            });

        $categories = Category::where('type', 'expense')
            ->orderBy('name')
            ->get(['id', 'name']);

        $currencies = Currency::orderBy('code')->get(['id', 'code', 'name']);
        $workspaces = Workspace::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
            'categories' => $categories,
            'currencies' => $currencies,
            'workspaces' => $workspaces,
        ]);
    }

    /**
     * Store a newly created budget.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
            'currency_id' => 'required|exists:currencies,id',
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'period' => 'required|in:monthly,weekly,yearly,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $budget = Budget::create([
            'workspace_id' => $validated['workspace_id'],
            'currency_id' => $validated['currency_id'],
            'name' => $validated['name'],
            'amount' => $validated['amount'],
            'period' => $validated['period'],
            'start_date' => $validated['start_date'] ?? ($validated['period'] === 'monthly' ? now()->startOfMonth()->toDateString() : null),
            'end_date' => $validated['end_date'] ?? ($validated['period'] === 'monthly' ? now()->endOfMonth()->toDateString() : null),
        ]);

        if (!empty($validated['category_ids'])) {
            $budget->categories()->sync($validated['category_ids']);
        }

        return redirect()
            ->route('budgets.index')
            ->with('success', 'Budget created successfully.');
    }

    /**
     * Delete an existing budget.
     */
    public function destroy(Budget $budget): RedirectResponse
    {
        $budget->delete();

        return redirect()
            ->route('budgets.index')
            ->with('success', 'Budget deleted successfully.');
    }
}
