import { useForm, Link } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password');
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
                        Reset password
                    </h2>
                    <p className="text-gray-500 mt-2 mb-6 text-sm">
                        Choose a new, secure password for your account.
                    </p>

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
                                New password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="New password"
                                autoComplete="new-password"
                                autoFocus
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Confirm new password
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
                        >
                            {processing ? 'Resetting password...' : 'Reset password'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        <Link href="/login" className="text-green-700 font-semibold">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

