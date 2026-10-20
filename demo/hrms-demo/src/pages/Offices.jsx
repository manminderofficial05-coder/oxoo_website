import { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_OFFICES } from '../data/offices';
import { getDemoData, setDemoData } from '../utils/demoStorage';

export default function Offices() {
  const [offices, setOffices] = useState(() =>
    getDemoData('office_records', INITIAL_OFFICES)
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null); // 'new' | edit object
  const [viewDetails, setViewDetails] = useState(null);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    name: '',
    location: '',
    manager: 'Sarah Williams',
    workingHours: '09:00 AM – 06:00 PM',
    status: 'Active',
    radiusMeters: 100,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = useMemo(() => {
    return offices.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.manager.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [offices, search, statusFilter]);

  const openNewModal = () => {
    setForm({
      name: '',
      location: '',
      manager: 'Sarah Williams',
      workingHours: '09:00 AM – 06:00 PM',
      status: 'Active',
      radiusMeters: 100,
    });
    setModal('new');
  };

  const openEditModal = (item) => {
    setForm({
      name: item.name,
      location: item.location,
      manager: item.manager,
      workingHours: item.workingHours || '09:00 AM – 06:00 PM',
      status: item.status || 'Active',
      radiusMeters: item.radiusMeters || 100,
    });
    setModal(item);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;

    if (modal === 'new') {
      const newItem = {
        _id: `off-${Date.now()}`,
        name: form.name.trim(),
        location: form.location.trim(),
        employeesCount: 0,
        manager: form.manager,
        workingHours: form.workingHours,
        status: form.status,
        radiusMeters: Number(form.radiusMeters) || 100,
        lat: 12.9716,
        lng: 77.5946,
      };
      const updated = [...offices, newItem];
      setOffices(updated);
      setDemoData('office_records', updated);
      showToast(`Added office "${newItem.name}"`);
    } else {
      const updated = offices.map((item) =>
        item._id === modal._id
          ? {
              ...item,
              name: form.name.trim(),
              location: form.location.trim(),
              manager: form.manager,
              workingHours: form.workingHours,
              status: form.status,
              radiusMeters: Number(form.radiusMeters) || 100,
            }
          : item
      );
      setOffices(updated);
      setDemoData('office_records', updated);
      showToast(`Updated "${form.name}"`);
    }
    setModal(null);
  };

  const handleDelete = (id, name) => {
    const updated = offices.filter((item) => item._id !== id);
    setOffices(updated);
    setDemoData('office_records', updated);
    showToast(`Removed office "${name}"`);
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
          title="Offices"
          subtitle="Corporate headquarters, branch locations and geofenced attendance zones."
          workspace="Admin Workspace"
        />
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition"
        >
          <Plus size={16} /> Add Office
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Offices"
          value={offices.length}
          hint="Across 5 metros"
          icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Total Base Capacity"
          value={offices.reduce((acc, c) => acc + (c.employeesCount || 0), 0)}
          hint="Employees stationed"
          icon={Users}
          tone="green"
        />
        <StatCard
          label="Active Geofences"
          value={offices.filter((o) => o.status === 'Active').length}
          hint="GPS auto check-in enabled"
          icon={MapPin}
          tone="purple"
        />
      </div>

      {/* Offices Table Card */}
      <Card title="Corporate Offices" subtitle="Registered branches with geofencing coordinates and office managers.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search office name, location or manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Office Name</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4 text-center">Employees</th>
                <th className="pb-3 pr-4">Manager</th>
                <th className="pb-3 pr-4">Working Hours</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pr-4">
                    <span className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Building2 size={16} className="text-sky-600 shrink-0" />
                      {item.name}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-slate-600 max-w-[240px] truncate">
                    {item.location}
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                      {item.employeesCount} staff
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-bold text-slate-700">
                    {item.manager}
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {item.workingHours}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewDetails(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="Edit office"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete office"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No offices match your search criteria.
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
                {modal === 'new' ? 'Add Office' : 'Edit Office'}
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
                Office Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pune Innovation Hub"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Address / Location
              </label>
              <textarea
                rows={2}
                required
                placeholder="Street address, city, state, postal code..."
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Manager
                </label>
                <input
                  type="text"
                  value={form.manager}
                  onChange={(e) => setForm({ ...form, manager: e.target.value })}
                  className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Radius (Meters)
                </label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={form.radiusMeters}
                  onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })}
                  className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={form.workingHours}
                  onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                  className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
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
                {modal === 'new' ? 'Add Office' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/5 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 size={18} className="text-sky-600" />
                  {viewDetails.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Manager: {viewDetails.manager} · {viewDetails.status}
                </p>
              </div>
              <button
                onClick={() => setViewDetails(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400">Address</span>
                <p className="mt-1 font-medium text-slate-800 leading-relaxed">{viewDetails.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400">Working Hours</span>
                  <p className="mt-1 font-semibold text-slate-800">{viewDetails.workingHours}</p>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400">Geofence Radius</span>
                  <p className="mt-1 font-semibold text-slate-800">{viewDetails.radiusMeters} meters</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewDetails(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}