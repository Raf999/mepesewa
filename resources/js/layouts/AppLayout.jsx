
import { Link, router, usePage } from '@inertiajs/react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '▦' },
    { name: 'Transactions', href: '/transactions', icon: '⇄' },
    { name: 'Income', href: '/income', icon: '↗' },
    { name: 'Budgets', href: '/budgets', icon: '📊' },
    { name: 'Workspaces', href: '/workspaces', icon: '🗂' },
    { name: 'Accounts', href: '/accounts', icon: '🏦' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Payment Methods', href: '/payment-methods', icon: '💳' },
    { name: 'Savings Goals', href: '/savings-goals', icon: '◎' },
    { name: 'Reports', href: '/reports', icon: '▥' },
];

export default function AppLayout({ children }) {
    const { auth, url } = usePage().props;
    const currentPath = usePage().url.split('?')[0];

    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">

            {/* Sidebar */}
            <aside className="w-full border-b border-gray-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
                <div className="mb-8 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white">
                        M
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            MePesewa
                        </h1>
                        <p className="text-xs text-gray-400">
                            Personal Finance
                        </p>
                    </div>
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Workspace
                </p>

                <nav className="flex gap-2 overflow-x-auto md:flex-col">
                    {navigation.map((item) => {
                        const active =
                            currentPath === item.href ||
                            currentPath.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 hidden rounded-2xl bg-emerald-50 p-4 md:block">
                    <p className="text-sm font-semibold text-emerald-900">
                        Every pesewa counts.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                        Make smarter financial decisions with MePesewa.
                    </p>
                </div>

                <div className="mt-6 hidden border-t border-gray-100 pt-6 md:block">
                    <div className="mb-4 px-4">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {user?.email || ''}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <span className="text-lg">⎋</span>
                        Log out
                    </button>
                </div>
            </aside>

            {/* Page Content */}
            <div className="min-w-0 flex-1">
                {children}
            </div>
        </div>
    );
}
