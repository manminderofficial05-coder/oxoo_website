import { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_HOLIDAYS } from '../data/holidays';
import { getDemoData, setDemoData } from '../utils/demoStorage';

export default function Holidays() {
  const [holidays, setHolidays] = useState(() =>
    getDemoData('holiday_records', INITIAL_HOLIDAYS)
  );
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    name: '',
    date: '',
    type: 'National Holiday',
    appliesTo: 'All Locations',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const types = useMemo(() => {
    const set = new Set(holidays.map((h) => h.type));
    return ['All', ...Array.from(set)];
  }, [holidays]);

  const filtered = useMemo(() => {
    return holidays.filter((h) => {
      const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || h.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [holidays, search, typeFilter]);

  const upcomingHolidays = useMemo(
    () => holidays.filter((h) => h.status === 'Upcoming'),
    [holidays]
  );

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'Long' });
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;

    const day = getDayName(form.date);
    const newHol = {
      _id: `hol-${Date.now()}`,
      name: form.name.trim(),
      date: form.date,
      day: day || 'Weekday',
      type: form.type,
      appliesTo: form.appliesTo,
      status: 'Upcoming',
    };

    const nextList = [...holidays, newHol].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setHolidays(nextList);
    setDemoData('holiday_records', nextList);
    setModalOpen(false);
    setForm({ name: '', date: '', type: 'National Holiday', appliesTo: 'All Locations' });
    showToast(`Added holiday "${newHol.name}"`);
  };

  const handleDelete = (id, name) => {
    const nextList = holidays.filter((h) => h._id !== id);
    setHolidays(nextList);
    setDemoData('holiday_records', nextList);
    showToast(`Removed "${name}"`);
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Banner
          title="Company Holidays"
          subtitle="Manage public holidays and company-wide days off."
          workspace="Admin Workspace"
        />
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition"
        >
          <Plus size={16} /> Add Holiday
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Holidays"
          value={holidays.length}
          hint="Calendar Year 2026-2027"
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Upcoming Holidays"
          value={upcomingHolidays.length}
          hint="Next: Republic Day"
          icon={CalendarCheck}
          tone="green"
        />
        <StatCard
          label="National Holidays"
          value={holidays.filter((h) => h.type === 'National Holiday').length}
          hint="Mandatory company wide"
          icon={Sparkles}
          tone="orange"
        />
      </div>

      {/* Holiday Table & Card */}
      <Card title="Holidays Schedule" subtitle="Official declared days off across all corporate offices.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search holiday name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter size={14} /> Type:
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Holiday</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Day</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Applies To</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pr-4">
                    <span className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Calendar size={15} className="text-sky-600" />
                      {h.name}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs font-bold text-slate-700">
                    {new Date(h.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-semibold text-slate-600">{h.day}</td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-100">
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-medium text-slate-600">{h.appliesTo}</td>
                  <td className="py-3.5 pr-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                        h.status === 'Upcoming'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(h._id, h.name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove holiday"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No holidays match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Holiday Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAddHoliday}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">Add Company Holiday</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Holiday Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Diwali / Republic Day"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Holiday Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="National Holiday">National Holiday</option>
                <option value="Gazetted Holiday">Gazetted Holiday</option>
                <option value="Public Holiday">Public Holiday</option>
                <option value="Optional Holiday">Optional Holiday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Applies To
              </label>
              <input
                type="text"
                value={form.appliesTo}
                onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-sky-700 transition"
              >
                Add Holiday
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}