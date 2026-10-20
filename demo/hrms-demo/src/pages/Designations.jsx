import { useMemo, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_DESIGNATIONS } from '../data/designations';
import { getDemoData, setDemoData } from '../utils/demoStorage';

export default function Designations() {
  const [list, setList] = useState(() =>
    getDemoData('designation_records', INITIAL_DESIGNATIONS)
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modal, setModal] = useState(null); // 'new' | edit object
  const [viewingDesignation, setViewingDesignation] = useState(null);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    name: '',
    department: 'Engineering',
    description: '',
    status: 'Active',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const departments = useMemo(() => {
    const set = new Set(list.map((d) => d.department));
    return ['All', ...Array.from(set)];
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.department.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchDept = deptFilter === 'All' || item.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [list, search, statusFilter, deptFilter]);

  const openNewModal = () => {
    setForm({
      name: '',
      department: 'Engineering',
      description: '',
      status: 'Active',
    });
    setModal('new');
  };

  const openEditModal = (item) => {
    setForm({
      name: item.name,
      department: item.department,
      description: item.description || '',
      status: item.status || 'Active',
    });
    setModal(item);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (modal === 'new') {
      const newItem = {
        _id: `des-${Date.now()}`,
        name: form.name.trim(),
        department: form.department,
        employeesCount: 0,
        status: form.status,
        createdDate: new Date().toISOString().slice(0, 10),
        description: form.description,
      };
      const updated = [newItem, ...list];
      setList(updated);
      setDemoData('designation_records', updated);
      showToast(`Added designation "${newItem.name}"`);
    } else {
      const updated = list.map((item) =>
        item._id === modal._id
          ? {
              ...item,
              name: form.name.trim(),
              department: form.department,
              description: form.description,
              status: form.status,
            }
          : item
      );
      setList(updated);
      setDemoData('designation_records', updated);
      showToast(`Updated "${form.name}"`);
    }
    setModal(null);
  };

  const handleDelete = (id, name) => {
    const updated = list.filter((item) => item._id !== id);
    setList(updated);
    setDemoData('designation_records', updated);
    showToast(`Deleted designation "${name}"`);
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
          title="Designations"
          subtitle="Manage official job titles, hierarchy levels and department allocations."
          workspace="Admin Workspace"
        />
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition"
        >
          <Plus size={16} /> Add Designation
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Designations"
          value={list.length}
          hint="Across all business units"
          icon={Briefcase}
          tone="blue"
        />
        <StatCard
          label="Assigned Employees"
          value={list.reduce((acc, c) => acc + (c.employeesCount || 0), 0)}
          hint="Active staff mapped"
          icon={Users}
          tone="green"
        />
        <StatCard
          label="Active Status"
          value={list.filter((d) => d.status === 'Active').length}
          hint="Available in onboarding"
          icon={CheckCircle2}
          tone="purple"
        />
      </div>

      {/* Main Table Card */}
      <Card title="Company Designations" subtitle="Job titles mapped to organizational departments.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search designation or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter size={14} /> Department:
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

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
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Designation</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4 text-center">Employees</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 pr-4">Created Date</th>
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
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {item.department}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <button
                      onClick={() => setViewingDesignation(item)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                    >
                      <Users size={12} /> {item.employeesCount} staff
                    </button>
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
                  <td className="py-3.5 pr-4 text-xs font-mono text-slate-600">
                    {item.createdDate}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="Edit designation"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete designation"
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
                    No designations match your search criteria.
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
                {modal === 'new' ? 'Add Designation' : 'Edit Designation'}
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
                Designation Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Software Engineer"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
              </select>
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Responsibilities, seniority, and key domain..."
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
                {modal === 'new' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Employees Modal */}
      {viewingDesignation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-black/5 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {viewingDesignation.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingDesignation.department} · {viewingDesignation.employeesCount} assigned employees
                </p>
              </div>
              <button
                onClick={() => setViewingDesignation(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl">
              {viewingDesignation.description || 'No description provided.'}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingDesignation(null)}
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