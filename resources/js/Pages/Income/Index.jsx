import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

const formatMoney = (amount, currency = 'GHS') =>
    new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency,
    }).format(Number(amount));

export default function Index({ incomes, stats }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'income',
        amount: '',
        currency: 'GHS',
        category: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post('/transactions', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Income - MePesewa" />

            <main className="mx-auto w-full max-w-7xl p-5 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Income
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Track and manage all your income streams.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
                    >
                        {showForm ? 'Close Form' : '+ Add Income'}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Total Income (All Time)</p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                ↗
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold text-gray-900">
                            {formatMoney(stats?.total || 0)}
                        </h3>
                        <p className="mt-2 text-xs text-gray-400">Recorded across all time</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">This Month's Income</p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                📅
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold text-gray-900">
                            {formatMoney(stats?.this_month || 0)}
                        </h3>
                        <p className="mt-2 text-xs text-gray-400">Total earned this month</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* New Income Form */}
                {showForm && (
                    <form
                        onSubmit={submit}
                        className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                    >
                        <h2 className="mb-6 text-lg font-semibold text-gray-900">
                            Add New Income
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Amount (GHS) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                                    required
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Category *
                                </label>
                                <input
                                    type="text"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    placeholder="Salary, Freelance, Investment, Gift..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                                    required
                                />
                                {errors.category && (
                                    <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                                    required
                                />
                                {errors.transaction_date && (
                                    <p className="mt-1 text-xs text-red-500">{errors.transaction_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Payment Method
                                </label>
                                <input
                                    type="text"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    placeholder="Bank Transfer, Mobile Money, Cash..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Description / Source
                                </label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="e.g. November Monthly Salary"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Income'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Incomes Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <h2 className="font-semibold text-gray-900">Income Records</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Detailed list of all recorded income transactions.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.data.length > 0 ? (
                                    incomes.data.map((income) => (
                                        <tr key={income.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                            <td className="p-4 font-medium text-gray-900">
                                                {income.description || income.category}
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {income.category}
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {income.transaction_date}
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {income.payment_method || '—'}
                                            </td>
                                            <td className="p-4 text-right font-semibold text-emerald-600">
                                                +{formatMoney(income.amount, income.currency)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-500">
                                            No income recorded yet. Click "+ Add Income" above to add your first income stream.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {incomes.links && incomes.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-5 text-sm">
                            <p className="text-gray-500">
                                Showing {incomes.from || 0} to {incomes.to || 0} of {incomes.total} records
                            </p>

                            <div className="flex gap-2">
                                {incomes.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded-lg border px-3 py-2 ${
                                            link.active
                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}

