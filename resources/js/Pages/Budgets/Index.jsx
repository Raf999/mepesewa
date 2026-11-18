import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

const formatMoney = (amount, currency = 'GHS') => {
    const code = typeof currency === 'string' ? currency : (currency?.code || 'GHS');
    try {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
        }).format(Number(amount ?? 0));
    } catch {
        return `${code} ${Number(amount ?? 0).toFixed(2)}`;
    }
};

export default function Index() {
    const { flash, budgets = [], categories = [], currencies = [], workspaces = [] } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        amount: '',
        workspace_id: workspaces[0]?.id || '',
        currency_id: currencies[0]?.id || '',
        period: 'monthly',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        category_ids: [],
    });

    const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
    const totalRemaining = Math.max(0, totalBudgeted - totalSpent);

    const submit = (e) => {
        e.preventDefault();
        post('/budgets', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = (budget) => {
        if (confirm(`Are you sure you want to delete the budget "${budget.name}"?`)) {
            router.delete(`/budgets/${budget.id}`);
        }
    };

    const toggleCategory = (categoryId) => {
        const current = [...data.category_ids];
        const index = current.indexOf(categoryId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(categoryId);
        }
        setData('category_ids', current);
    };

    return (
        <AppLayout>
            <Head title="Budgets - MePesewa" />

            <main className="mx-auto w-full max-w-7xl p-5 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Set spending limits, assign expense categories, and track progress in real-time.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
                    >
                        {showForm ? 'Close Form' : '+ Create Budget'}
                    </button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* Top Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Allocated</p>
                        <h3 className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(totalBudgeted)}</h3>
                        <p className="mt-1 text-xs text-gray-400">Across {budgets.length} active budget(s)</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</p>
                        <h3 className="mt-2 text-2xl font-bold text-red-600">{formatMoney(totalSpent)}</h3>
                        <p className="mt-1 text-xs text-gray-400">
                            {totalBudgeted > 0 ? `${Math.round((totalSpent / totalBudgeted) * 100)}% of total allocated` : '0% used'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</p>
                        <h3 className="mt-2 text-2xl font-bold text-emerald-600">{formatMoney(totalRemaining)}</h3>
                        <p className="mt-1 text-xs text-gray-400">Available to spend</p>
                    </div>
                </div>

                {/* Create Budget Form */}
                {showForm && (
                    <form onSubmit={submit} className="mb-8 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 border-b pb-4">
                            <h2 className="text-lg font-bold text-gray-900">Define New Budget</h2>
                            <p className="text-xs text-gray-500">
                                Allocate a maximum spending cap for specific categories or overall activity.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Budget Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Monthly Groceries, Transportation"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Spending Limit</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    required
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Workspace</label>
                                <select
                                    value={data.workspace_id}
                                    onChange={(e) => setData('workspace_id', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    required
                                >
                                    <option value="">Select workspace</option>
                                    {workspaces.map((ws) => (
                                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                                    ))}
                                </select>
                                {errors.workspace_id && <p className="mt-1 text-sm text-red-600">{errors.workspace_id}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Currency</label>
                                <select
                                    value={data.currency_id}
                                    onChange={(e) => setData('currency_id', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    required
                                >
                                    <option value="">Select currency</option>
                                    {currencies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                                {errors.currency_id && <p className="mt-1 text-sm text-red-600">{errors.currency_id}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Period</label>
                                <select
                                    value={data.period}
                                    onChange={(e) => setData('period', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="custom">Custom Date Range</option>
                                </select>
                                {errors.period && <p className="mt-1 text-sm text-red-600">{errors.period}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                />
                                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                            </div>

                            {data.period === 'custom' && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    />
                                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                                </div>
                            )}
                        </div>

                        {/* Assigned Categories */}
                        <div className="mt-5 border-t border-gray-100 pt-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Apply to Expense Categories (Optional — leave unselected for all expenses)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((c) => {
                                    const selected = data.category_ids.includes(c.id);
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => toggleCategory(c.id)}
                                            className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                                                selected
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {selected ? '✓ ' : '+ '} {c.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setShowForm(false);
                                }}
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                                {processing ? 'Saving...' : 'Save Budget'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Budgets List Cards */}
                <div className="space-y-4">
                    {budgets.length > 0 ? (
                        budgets.map((budget) => {
                            const isOver = budget.is_over_budget;
                            const isWarning = !isOver && budget.percentage >= 80;

                            const barColor = isOver
                                ? 'bg-red-500'
                                : isWarning
                                ? 'bg-amber-500'
                                : 'bg-emerald-500';

                            const badgeColor = isOver
                                ? 'bg-red-50 text-red-700'
                                : isWarning
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700';

                            const statusLabel = isOver
                                ? 'Over Budget'
                                : isWarning
                                ? 'Near Limit (80%+)'
                                : 'On Track';

                            return (
                                <div
                                    key={budget.id}
                                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-gray-900">{budget.name}</h3>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
                                                    {statusLabel}
                                                </span>
                                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
                                                    {budget.period}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Workspace: <span className="font-medium text-gray-600">{budget.workspace || '—'}</span>
                                                {budget.start_date && ` · Period: ${budget.start_date} ${budget.end_date ? 'to ' + budget.end_date : ''}`}
                                            </p>

                                            {budget.categories?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {budget.categories.map((c) => (
                                                        <span
                                                            key={c.id}
                                                            className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                                                        >
                                                            {c.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatMoney(budget.spent, budget.currency)}{' '}
                                                <span className="font-normal text-gray-400">
                                                    of {formatMoney(budget.amount, budget.currency)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {isOver ? (
                                                    <span className="font-semibold text-red-600">
                                                        +{formatMoney(budget.spent - budget.amount, budget.currency)} over
                                                    </span>
                                                ) : (
                                                    <span>{formatMoney(budget.remaining, budget.currency)} remaining</span>
                                                )}
                                            </p>
                                            <button
                                                onClick={() => handleDelete(budget)}
                                                className="mt-2 text-xs font-medium text-red-500 hover:text-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
                                            <span>{budget.percentage}% spent</span>
                                            <span>Limit: {formatMoney(budget.amount, budget.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                            <span className="text-4xl">📊</span>
                            <h3 className="mt-3 text-lg font-semibold text-gray-900">No Budgets Created Yet</h3>
                            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                Plan your spending limits for food, rent, or utilities and keep track of every cedi spent.
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
                            >
                                + Create First Budget
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
