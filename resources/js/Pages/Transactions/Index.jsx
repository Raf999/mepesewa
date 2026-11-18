import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    const { flash, accounts, categories, paymentMethods, currencies, transactions } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'expense',
        amount: '',
        currency_id: '',
        source_account_id: '',
        destination_account_id: '',
        category_id: '',
        payment_method_id: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const isIncome = data.type === 'income';
    const isTransfer = data.type === 'transfer';
    const isExpense = data.type === 'expense';

    // Filter categories to only show income or expense categories matching the active tab
        // Find the selected account to detect its workspace_id
    const activeAccountId = isIncome ? data.destination_account_id : data.source_account_id;
    const selectedAccount = accounts?.find(a => String(a.id) === String(activeAccountId));
    const activeWorkspaceId = data.workspace_id || selectedAccount?.workspace_id;

    // Filter categories by transaction type AND selected account's workspace
    const filteredCategories = categories?.filter(c => {
        const matchesType = !c.type || c.type === data.type;
        const matchesWorkspace = activeWorkspaceId
            ? String(c.workspace_id) === String(activeWorkspaceId)
            : true;
        return matchesType && matchesWorkspace;
    }) || [];


    const handleTypeChange = (newType) => {
        setData(prev => {
            const next = {
                ...prev,
                type: newType,
                category_id: '', // Reset category when switching type
            };
            if (newType === 'income') {
                next.source_account_id = '';
            } else if (newType === 'expense') {
                next.destination_account_id = '';
            }
            return next;
        });
    };

    const submit = (e) => {
        e.preventDefault();

        post('/transactions', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = (transaction) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            router.delete(`/transactions/${transaction.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Transactions - MePesewa" />

            <main className="mx-auto w-full max-w-7xl p-5 md:p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your income, expenses, and account transfers.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
                    >
                        {showForm ? 'Close Form' : '+ Add Transaction'}
                    </button>
                </div>

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

                {showForm && (
                    <form
                        onSubmit={submit}
                        className={`mb-8 rounded-2xl border p-6 shadow-sm transition bg-white ${
                            isIncome
                                ? 'border-emerald-200'
                                : isTransfer
                                ? 'border-blue-200'
                                : 'border-rose-200'
                        }`}
                    >
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {isIncome
                                        ? 'Record New Income'
                                        : isTransfer
                                        ? 'Record Account Transfer'
                                        : 'Record New Expense'}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {isIncome
                                        ? 'Deposit money into one of your financial accounts.'
                                        : isTransfer
                                        ? 'Move funds between two accounts (e.g., Bank to MoMo).'
                                        : 'Record an expense paid from one of your financial accounts.'}
                                </p>
                            </div>

                            {/* Mode toggle */}
                            <div className="flex rounded-xl bg-gray-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('expense')}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                        isExpense
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    - Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('income')}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                        isIncome
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    + Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('transfer')}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                        isTransfer
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    ⇄ Transfer
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Amount */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>

                            {/* Source Account (Expense or Transfer) */}
                            {(isExpense || isTransfer) && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {isTransfer ? 'From Account (Source)' : 'Paid From Account'}
                                    </label>
                                    <select
                                        value={data.source_account_id}
                                        onChange={e => {
                                            const accId = e.target.value;
                                            const acc = accounts?.find(a => String(a.id) === String(accId));
                                            setData(prev => ({
                                                ...prev,
                                                source_account_id: accId,
                                                category_id: '', // <-- Resets category when source account changes
                                                ...(acc?.currency_id ? { currency_id: acc.currency_id } : {})
                                            }));
                                        }}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select account</option>
                                        {accounts?.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} {a.currency?.code ? `(${a.currency.code})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.source_account_id && <p className="mt-1 text-sm text-red-600">{errors.source_account_id}</p>}
                                </div>
                            )}

                            {/* Destination Account (Income or Transfer) */}
                            {(isIncome || isTransfer) && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {isTransfer ? 'To Account (Destination)' : 'Deposit Into Account'}
                                    </label>
                                    <select
                                        value={data.destination_account_id}
                                        onChange={e => {
                                            const accId = e.target.value;
                                            const acc = accounts?.find(a => String(a.id) === String(accId));
                                            setData(prev => ({
                                                ...prev,
                                                destination_account_id: accId,
                                                category_id: '', // <-- Resets category when destination account changes
                                                ...(!isTransfer && acc?.currency_id ? { currency_id: acc.currency_id } : {})
                                            }));
                                        }}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select account</option>
                                        {accounts?.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} {a.currency?.code ? `(${a.currency.code})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.destination_account_id && <p className="mt-1 text-sm text-red-600">{errors.destination_account_id}</p>}
                                </div>
                            )}

                            {/* Currency */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Currency
                                </label>
                                <select
                                    value={data.currency_id}
                                    onChange={e => setData('currency_id', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    required
                                >
                                    <option value="">Select currency</option>
                                    {currencies?.map(c => (
                                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                                {errors.currency_id && <p className="mt-1 text-sm text-red-600">{errors.currency_id}</p>}
                            </div>

                            {/* Category (only for Income & Expense) */}
                            {!isTransfer && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {isIncome ? 'Income Category' : 'Expense Category'}
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        disabled={!activeWorkspaceId}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">
                                            {activeWorkspaceId ? 'Select category' : 'Select an account first'}
                                        </option>
                                        {filteredCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                </div>
                            )}


                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    placeholder={
                                        isIncome
                                            ? 'e.g. Monthly Salary, Freelance project'
                                            : isTransfer
                                            ? 'e.g. Moved cash to Mobile Money'
                                            : 'e.g. Grocery shopping, Electricity'
                                    }
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Transaction Date */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={e => setData('transaction_date', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                    required
                                />
                                {errors.transaction_date && <p className="mt-1 text-sm text-red-600">{errors.transaction_date}</p>}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Payment Method (Optional)
                                </label>
                                <select
                                    value={data.payment_method_id}
                                    onChange={e => setData('payment_method_id', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                                >
                                    <option value="">Select payment method</option>
                                    {paymentMethods?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.payment_method_id && <p className="mt-1 text-sm text-red-600">{errors.payment_method_id}</p>}
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
                                className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${
                                    isIncome
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : isTransfer
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {processing
                                    ? 'Saving...'
                                    : isIncome
                                    ? 'Save Income'
                                    : isTransfer
                                    ? 'Save Transfer'
                                    : 'Save Expense'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <h2 className="font-semibold text-gray-900">All Transactions</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Your recorded financial activities.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Account</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions?.data && transactions.data.length > 0 ? (
                                    transactions.data.map(transaction => {
                                        const isTxIncome = transaction.type === 'income';
                                        const isTxTransfer = transaction.type === 'transfer';

                                        let accountLabel = '—';
                                        if (isTxTransfer) {
                                            accountLabel = `${transaction.source_account?.name || '?'} → ${transaction.destination_account?.name || '?'}`;
                                        } else if (isTxIncome) {
                                            accountLabel = transaction.destination_account?.name ? `To: ${transaction.destination_account.name}` : '—';
                                        } else {
                                            accountLabel = transaction.source_account?.name ? `From: ${transaction.source_account.name}` : '—';
                                        }

                                        return (
                                            <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                                <td className="p-4 font-medium text-gray-900">
                                                    {transaction.description || 'Transaction'}
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    <span className="font-medium text-gray-700">
                                                        {accountLabel}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {isTxTransfer ? (
                                                        <span className="text-xs text-gray-400 italic">Transfer</span>
                                                    ) : (
                                                        (typeof transaction.category === 'object'
                                                            ? transaction.category?.name
                                                            : transaction.category) || '—'
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-500 whitespace-nowrap">
                                                    {transaction.transaction_date}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                                        isTxIncome
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : isTxTransfer
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        {isTxIncome ? '+ Income' : isTxTransfer ? '⇄ Transfer' : '- Expense'}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-right font-semibold whitespace-nowrap ${
                                                    isTxIncome
                                                        ? 'text-emerald-600'
                                                        : isTxTransfer
                                                        ? 'text-blue-600'
                                                        : 'text-red-600'
                                                }`}>
                                                    {isTxIncome ? '+' : isTxTransfer ? '' : '-'}
                                                    {formatMoney(transaction.amount, transaction.currency)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(transaction)}
                                                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-gray-500">
                                            No transactions yet. Click "+ Add Transaction" to record your first income, expense, or transfer.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transactions?.links && transactions.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-5 text-sm">
                            <p className="text-gray-500">
                                Showing {transactions.from || 0} to {transactions.to || 0}
                                {' '}of {transactions.total} transactions
                            </p>

                            <div className="flex gap-2">
                                {transactions.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded-lg border px-3 py-2 ${link.active
                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                            : 'border-gray-200 text-gray-600'
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
