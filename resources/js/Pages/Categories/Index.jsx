import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

export default function Index() {
  const { flash, categories = [], workspaces = [] } = usePage().props;
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, setData, post, processing, errors, reset } = useForm({
    workspace_id: workspaces && workspaces.length > 0 ? workspaces[0].id : '',
    name: '',
    type: 'expense',
    is_active: true,
  });

  const filteredCategories = categories.filter((category) => {
    if (typeFilter === 'all') return true;
    return category.type === typeFilter;
  });

  const expenseCount = categories.filter((c) => c.type === 'expense').length;
  const incomeCount = categories.filter((c) => c.type === 'income').length;

  const handleToggleForm = () => {
    if (!showForm && (typeFilter === 'expense' || typeFilter === 'income')) {
      setData('type', typeFilter);
    }
    setShowForm(!showForm);
  };

  const submit = (e) => {
    e.preventDefault();
    post('/categories', {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };
  

  const handleDelete = (category) => {
    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      router.delete(`/categories/${category.id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Categories - MePesewa" />
      <main className="mx-auto w-full max-w-7xl p-5 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your Categories.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            {showForm ? 'Close Form' : '+ Add Category'}
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
            <h2 className="mb-6 text-lg font-semibold text-gray-900">New Category</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gift, Food, Salary"
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
                <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={data.type}
                  onChange={e => setData('type', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              <div className="flex flex-col justify-center space-y-3 pt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={e => setData('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Category is active</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={handleToggleForm}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                {showForm ? 'Close Form' : '+ Add Category'}
              </button>

              <button
                type="submit"
                disabled={processing}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {processing ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              typeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('expense')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              typeFilter === 'expense'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Expense ({expenseCount})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('income')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Income ({incomeCount})
          </button>
        </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">
              {typeFilter === 'all' ? 'All Categories' : `${typeFilter === 'expense' ? 'Expense' : 'Income'} Categories`}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Workspace</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <tr key={category.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="p-4 text-gray-600">
                        {category.workspace?.name || '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            category.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {category.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            category.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No categories found. Click "+ Add Category" to create your first category.
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
