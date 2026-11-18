
import { useForm, Link } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-700">
                        MePesewa
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Every pesewa has a purpose.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="text-gray-500 mt-2 mb-6">
                        Sign in to manage your finances.
                    </p>

                    {status && (
                        <div className="mb-5 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="Your password"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-green-700"
                                />
                                Remember me
                            </label>

                            <Link href="/forgot-password" className="text-green-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-green-700 font-semibold">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
