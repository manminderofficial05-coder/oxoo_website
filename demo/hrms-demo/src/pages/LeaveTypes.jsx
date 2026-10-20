import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Filter,
  ListChecks,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_LEAVE_TYPES } from '../data/leaveTypes';
import { getDemoData, setDemoData } from '../utils/demoStorage';

export default function LeaveTypes() {
  const [list, setList] = useState(() =>
    getDemoData('leave_type_records', INITIAL_LEAVE_TYPES)
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null); // 'new' | edit object
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    name: '',
    daysAllowed: 10,
    isPaid: true,
    carryForward: 'No',
    status: 'Active',
    description: '',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [list, search, statusFilter]);

  const openNewModal = () => {
    setForm({
      name: '',
      daysAllowed: 10,
      isPaid: true,
      carryForward: 'No',
      status: 'Active',
      description: '',
    });
    setModal('new');
  };

  const openEditModal = (item) => {
    setForm({
      name: item.name,
      daysAllowed: item.daysAllowed,
      isPaid: item.isPaid !== false,
      carryForward: item.carryForward || 'No',
      status: item.status || 'Active',
      description: item.description || '',
    });
    setModal(item);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (modal === 'new') {
      const newItem = {
        _id: `lt-${Date.now()}`,
        name: form.name.trim(),
        daysAllowed: Number(form.daysAllowed) || 0,
        isPaid: form.isPaid,
        carryForward: form.carryForward,
        status: form.status,
        description: form.description,
      };
      const updated = [...list, newItem];
      setList(updated);
      setDemoData('leave_type_records', updated);
      showToast(`Created leave type "${newItem.name}"`);
    } else {
      const updated = list.map((item) =>
        item._id === modal._id
          ? {
              ...item,
              name: form.name.trim(),
              daysAllowed: Number(form.daysAllowed) || 0,
              isPaid: form.isPaid,
              carryForward: form.carryForward,
              status: form.status,
              description: form.description,
            }
          : item
      );
      setList(updated);
      setDemoData('leave_type_records', updated);
      showToast(`Updated "${form.name}"`);
    }
    setModal(null);
  };

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    const updated = list.map((item) =>
      item._id === id ? { ...item, status: nextStatus } : item
    );
    setList(updated);
    setDemoData('leave_type_records', updated);
    showToast(`Leave type set to ${nextStatus}`);
  };

  const handleDelete = (id, name) => {
    const updated = list.filter((item) => item._id !== id);
    setList(updated);
    setDemoData('leave_type_records', updated);
    showToast(`Deleted leave category "${name}"`);
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Banner
          title="Leave Types"
          subtitle="Configure annual time off allocations, paid policies and carry forward rules."
          workspace="Admin Workspace"
        />
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition"
        >
          <Plus size={16} /> Add Leave Type
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Leave Policies"
          value={list.length}
          hint="Standard categories"
          icon={ListChecks}
          tone="blue"
        />
        <StatCard
          label="Active Policies"
          value={list.filter((l) => l.status === 'Active').length}
          hint="Available in employee portal"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Paid Leave Types"
          value={list.filter((l) => l.isPaid).length}
          hint="No salary deduction"
          icon={Clock}
          tone="purple"
        />
      </div>

      {/* Main Table Card */}
      <Card title="Leave Categories & Quotas" subtitle="Rules determining employee time-off eligibility and balance calculations.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leave type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter size={14} /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Leave Type</th>
                <th className="pb-3 pr-4 text-center">Days Allowed</th>
                <th className="pb-3 pr-4 text-center">Paid / Unpaid</th>
                <th className="pb-3 pr-4">Carry Forward</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pr-4">
                    <span className="font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">{item.description}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-center font-bold text-slate-800">
                    <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold">
                      {item.daysAllowed} days/yr
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-semibold text-slate-600">
                    {item.carryForward}
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <button
                      onClick={() => toggleStatus(item._id, item.status)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-80 ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status === 'Active' ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleStatus(item._id, item.status)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title={item.status === 'Active' ? 'Disable category' : 'Enable category'}
                      >
                        {item.status === 'Active' ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="Edit leave type"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete leave type"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    No leave categories matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                {modal === 'new' ? 'Add Leave Type' : 'Edit Leave Type'}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Leave Type Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sabbatical Leave"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Days Allowed (Annual Quota)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                required
                value={form.daysAllowed}
                onChange={(e) => setForm({ ...form, daysAllowed: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Compensation
                </label>
                <select
                  value={form.isPaid ? 'paid' : 'unpaid'}
                  onChange={(e) => setForm({ ...form, isPaid: e.target.value === 'paid' })}
                  className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Carry Forward
                </label>
                <select
                  value={form.carryForward}
                  onChange={(e) => setForm({ ...form, carryForward: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="No">No</option>
                  <option value="Up to 5 days">Up to 5 days</option>
                  <option value="Up to 9 days">Up to 9 days</option>
                  <option value="Up to 15 days">Up to 15 days</option>
                  <option value="Within 60 days">Within 60 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Policy details, notice requirements, documentation..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-sky-700 transition"
              >
                {modal === 'new' ? 'Add Leave Type' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}