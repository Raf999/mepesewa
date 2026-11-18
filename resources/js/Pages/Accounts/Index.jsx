import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Index() {
  const { flash, accounts, currencies, workspaces } = usePage().props;
  const [showForm, setShowForm] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    workspace_id: workspaces && workspaces.length > 0 ? workspaces[0].id : '',
    currency_id: currencies && currencies.length > 0 ? currencies[0].id : '',
    name: '',
    type: 'cash',
    opening_balance: '0',
    opening_balance_date: new Date().toISOString().split('T')[0],
    institution: '',
    masked_identifier: '',
    is_active: true,
    include_in_totals: true,
  });

  const submit = (e) => {
    e.preventDefault();
    post('/accounts', {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  const handleDelete = (account) => {
    if (confirm(`Are you sure you want to delete account "${account.name}"?`)) {
      router.delete(`/accounts/${account.id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Accounts - MePesewa" />
      <main className="mx-auto w-full max-w-7xl p-5 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Accounts</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your cash, bank, and mobile money accounts.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            {showForm ? 'Close Form' : '+ Add Account'}
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
          <form onSubmit={submit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">New Account</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. MTN MoMo, Ecobank Savings"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Workspace</label>
                <select
                  value={data.workspace_id}
                  onChange={e => setData('workspace_id', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                  required
                >
                  <option value="">Select workspace</option>
                  {workspaces?.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
                {errors.workspace_id && <p className="mt-1 text-sm text-red-600">{errors.workspace_id}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Account Type</label>
                <select
                  value={data.type}
                  onChange={e => setData('type', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="e_wallet">E‑Wallet</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Currency</label>
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Opening Balance</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.opening_balance}
                  onChange={e => setData('opening_balance', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                />
                {errors.opening_balance && <p className="mt-1 text-sm text-red-600">{errors.opening_balance}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Opening Balance Date</label>
                <input
                  type="date"
                  value={data.opening_balance_date}
                  onChange={e => setData('opening_balance_date', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                />
                {errors.opening_balance_date && <p className="mt-1 text-sm text-red-600">{errors.opening_balance_date}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Institution (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MTN, Telecel, GCB Bank"
                  value={data.institution}
                  onChange={e => setData('institution', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                />
                {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Account # / Masked ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 054****123"
                  value={data.masked_identifier}
                  onChange={e => setData('masked_identifier', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                />
                {errors.masked_identifier && <p className="mt-1 text-sm text-red-600">{errors.masked_identifier}</p>}
              </div>

              <div className="flex flex-col justify-center space-y-3 pt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={e => setData('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Account is active</span>
                </label>

                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.include_in_totals}
                    onChange={e => setData('include_in_totals', e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include in net worth totals</span>
                </label>
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
                {processing ? 'Saving...' : 'Save Account'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">All Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Workspace</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Currency</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts && accounts.length > 0 ? (
                  accounts.map(account => (
                    <tr key={account.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">
                        {account.name}
                        {account.institution && (
                          <span className="block text-xs text-gray-400">{account.institution}</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {account.workspace?.name || '—'}
                      </td>
                      <td className="p-4 capitalize text-gray-600">
                        {account.type?.replace('_', ' ')}
                      </td>
                      <td className="p-4 font-mono text-gray-600">
                        {account.currency?.code ?? '—'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="block font-semibold text-gray-900">
                          {Number(account.current_balance ?? account.opening_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-400">
                          Opening: {Number(account.opening_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(account)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No accounts found. Click "+ Add Account" to create your first account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
