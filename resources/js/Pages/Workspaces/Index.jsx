import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Index() {
  const { flash, workspaces } = usePage().props;
  const [showForm, setShowForm] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    type: 'business',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/workspaces', {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  const handleDelete = (workspace) => {
    if (confirm(`Are you sure you want to delete workspace "${workspace.name}"? All associated accounts and records will also be removed.`)) {
      router.delete(`/workspaces/${workspace.id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Workspaces - MePesewa" />
      <main className="mx-auto w-full max-w-5xl p-5 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize your personal, family, or business finances into distinct workspaces.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            {showForm ? 'Close Form' : '+ Add Workspace'}
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
            <h2 className="mb-4 text-lg font-semibold text-gray-900">New Workspace</h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Side Hustle, Consulting, Family"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Workspace Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData('type', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="business">Business Workspace</option>
                  <option value="personal">Personal Workspace</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
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
                {processing ? 'Saving...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">All Workspaces</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Accounts</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workspaces && workspaces.length > 0 ? (
                  workspaces.map((ws) => (
                    <tr key={ws.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">
                        {ws.name}
                        {ws.id === 1 && (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-normal text-emerald-700">
                            Default
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          ws.type === 'business'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {ws.type || 'personal'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {ws.financial_accounts_count ?? 0} account(s)
                      </td>
                      <td className="p-4 text-right">
                        {ws.id !== 1 ? (
                          <button
                            onClick={() => handleDelete(ws)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No workspaces found. Click "+ Add Workspace" to create one.
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
