import { usePage, Link } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';

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

function SummaryCard({ title, amount, change, icon, color, isCurrency = true }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${color}`}>
                    {icon}
                </div>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-gray-900">
                {isCurrency ? formatMoney(amount) : amount}
            </h3>

            <p className="mt-2 text-xs text-gray-500">{change}</p>
        </div>
    );
}

export default function Dashboard() {
    const {
        auth,
        stats = {},
        accounts = [],
        monthlyOverview = [],
        recentTransactions = [],
    } = usePage().props;

    const user = auth?.user;

    const today = new Intl.DateTimeFormat('en-GH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date());

    const maxChartValue = Math.max(
        ...monthlyOverview.flatMap((month) => [
            Number(month.income || 0),
            Number(month.expenses || 0),
        ]),
        1
    );

    return (
        <AppLayout>
            <main className="mx-auto w-full max-w-7xl p-5 md:p-8">

                {/* Topbar */}
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">{today}</p>
                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                            Dashboard
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your real-time financial overview.
                        </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/budgets"
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            📊 Budgets
                        </Link>
                        <Link
                            href="/workspaces"
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            🗂 Workspaces
                        </Link>
                        <Link
                            href="/accounts"
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            🏦 Accounts
                        </Link>
                        <Link
                            href="/transactions"
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            + New Transaction
                        </Link>
                    </div>
                </header>

                {/* Summary Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Net Worth"
                        amount={stats.totalBalance}
                        change="Total across all active accounts"
                        icon="◈"
                        color="bg-emerald-50 text-emerald-600"
                    />

                    <SummaryCard
                        title="Monthly Income"
                        amount={stats.monthlyIncome}
                        change="Recorded this month"
                        icon="↗"
                        color="bg-blue-50 text-blue-600"
                    />

                    <SummaryCard
                        title="Monthly Expenses"
                        amount={stats.monthlyExpenses}
                        change="Recorded this month"
                        icon="↘"
                        color="bg-red-50 text-red-600"
                    />

                    <SummaryCard
                        title="Accounts & Workspaces"
                        amount={`${stats.accountsCount ?? 0} Accounts`}
                        change={`Across ${stats.workspacesCount ?? 1} workspace(s)`}
                        icon="🗂"
                        color="bg-purple-50 text-purple-600"
                        isCurrency={false}
                    />
                </section>

                {/* Main Content Grid: Chart & Accounts List */}
                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* Financial Overview (6-Month Bar Chart) */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Financial Activity (Last 6 Months)
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comparison of income vs expenses
                                </p>
                            </div>
                        </div>

                        {monthlyOverview.length > 0 ? (
                            <>
                                <div className="mt-8 flex h-56 items-end justify-around gap-3 border-b border-gray-100 px-2 pb-2">
                                    {monthlyOverview.map((month) => {
                                        const incomeHeight =
                                            (Number(month.income || 0) / maxChartValue) * 100;

                                        const expenseHeight =
                                            (Number(month.expenses || 0) / maxChartValue) * 100;

                                        return (
                                            <div
                                                key={month.month}
                                                className="flex h-full flex-1 flex-col items-center justify-end"
                                            >
                                                <div className="flex h-full w-full items-end justify-center gap-1.5">
                                                    <div
                                                        title={`Income: ${formatMoney(month.income)}`}
                                                        className="w-3/5 max-w-7 rounded-t-md bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                                                        style={{
                                                            height: `${incomeHeight}%`,
                                                            minHeight: month.income > 0 ? '4px' : '0px',
                                                        }}
                                                    />

                                                    <div
                                                        title={`Expenses: ${formatMoney(month.expenses)}`}
                                                        className="w-3/5 max-w-7 rounded-t-md bg-red-400 transition-all duration-300 hover:bg-red-500"
                                                        style={{
                                                            height: `${expenseHeight}%`,
                                                            minHeight: month.expenses > 0 ? '4px' : '0px',
                                                        }}
                                                    />
                                                </div>

                                                <span className="mt-2 text-xs font-medium text-gray-400">
                                                    {month.month}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 flex justify-center gap-6 text-xs text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                                        Income
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block h-3 w-3 rounded-full bg-red-400" />
                                        Expenses
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-56 items-center justify-center text-center text-sm text-gray-400">
                                No financial data recorded for the last 6 months.
                            </div>
                        )}
                    </div>

                    {/* Financial Accounts Widget */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    My Accounts
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Current balances
                                </p>
                            </div>
                            <Link
                                href="/accounts"
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                            >
                                View All →
                            </Link>
                        </div>

                        <div className="mt-5 divide-y divide-gray-50">
                            {accounts.length > 0 ? (
                                accounts.map((acc) => (
                                    <div key={acc.id} className="flex items-center justify-between py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                                                🏦
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {acc.name}
                                                </p>
                                                <p className="text-xs capitalize text-gray-400">
                                                    {acc.institution || acc.type?.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">
                                                {formatMoney(acc.balance, acc.currency)}
                                            </p>
                                            <span className="text-[10px] font-mono uppercase text-gray-400">
                                                {acc.currency}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-gray-400">
                                    No accounts created yet.
                                    <Link
                                        href="/accounts"
                                        className="mt-2 block text-xs font-semibold text-emerald-600 hover:underline"
                                    >
                                        + Add Your First Account
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/accounts"
                            className="mt-5 block w-full rounded-xl border border-emerald-200 py-2.5 text-center text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                            + Manage Accounts
                        </Link>
                    </div>
                </section>

                {/* Recent Transactions Table */}
                <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Recent Transactions
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Latest movements across your financial accounts
                            </p>
                        </div>

                        <Link
                            href="/transactions"
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            View All Transactions
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                                    <th className="pb-3 font-medium">Description</th>
                                    <th className="pb-3 font-medium">Account</th>
                                    <th className="pb-3 font-medium">Category</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 text-right font-medium">Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => {
                                        const isIncome = transaction.type === 'income';

                                        return (
                                            <tr
                                                key={transaction.id}
                                                className="border-b border-gray-50 transition hover:bg-gray-50 last:border-0"
                                            >
                                                <td className="py-4 font-medium text-gray-900">
                                                    {transaction.name}
                                                </td>

                                                <td className="py-4 text-gray-500">
                                                    {transaction.account || '—'}
                                                </td>

                                                <td className="py-4 text-gray-500">
                                                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                        {transaction.category}
                                                    </span>
                                                </td>

                                                <td className="py-4 text-gray-500 whitespace-nowrap">
                                                    {transaction.date}
                                                </td>

                                                <td
                                                    className={`py-4 text-right font-semibold whitespace-nowrap ${
                                                        isIncome
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {isIncome ? '+' : '-'}
                                                    {formatMoney(
                                                        transaction.amount,
                                                        transaction.currency
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="py-10 text-center text-sm text-gray-400"
                                        >
                                            No transactions yet. Click "+ New Transaction" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 pb-4 text-center text-xs text-gray-400">
                    © 2026 MePesewa. Every pesewa has a purpose.
                </footer>

            </main>
        </AppLayout>
    );
}
