import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Pencil, Plus, Power, Search, XCircle } from 'lucide-react';
import api from '../api/axios';
import { Banner, Card, Empty, StatCard } from '../components/dash';
import { Modal, StatusBadge } from '../components/ui';

const field = 'mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2';
const label = 'block text-xs font-bold uppercase tracking-wide text-black/60';
const th = 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-black/40';
const td = 'px-4 py-3.5 align-middle';

function DepartmentForm({ department, existing, onSaved, onCancel }) {
  const editing = !!department;
  const [form, setForm] = useState({
    name: department?.name || '',
    description: department?.description || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) return setError('Department name must be at least 2 characters');
    if (name.length > 60) return setError('Department name must be 60 characters or fewer');
    const clash = existing.some(
      (d) => d.name.toLowerCase() === name.toLowerCase() && d._id !== department?._id
    );
    if (clash) return setError('A department with this name already exists');

    setSaving(true);
    setError('');
    try {
      const body = { name, description: form.description.trim() };
      if (editing) await api.patch(`/departments/${department._id}`, body);
      else await api.post('/departments', body);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      <label className={label}>
        Department name
        <input name="name" value={form.name} onChange={set} maxLength={60} autoFocus className={field} />
      </label>

      <label className={label}>
        Description (optional)
        <textarea name="description" rows={3} maxLength={300} value={form.description} onChange={set} className={field} />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
          Cancel
        </button>
        <button
          disabled={saving}
          className="rounded-full bg-role px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add department'}
        </button>
      </div>
    </form>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // { department? }

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.get('/departments');
      const list = Array.isArray(data) ? data : data?.data || data?.departments || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return departments.filter(
      (d) =>
        (!status || d.status === status) &&
        (!q || d.name.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q))
    );
  }, [departments, search, status]);

  const active = departments.filter((d) => d.status === 'active').length;

  const toggle = async (d) => {
    const next = d.status === 'active' ? 'inactive' : 'active';
    const count = d.employeeCount ?? 0;
    const msg =
      next === 'inactive'
        ? `Deactivate ${d.name}?${count ? ` It currently has ${count} employee(s); they keep their department but it can't be assigned to new people.` : ''}`
        : `Reactivate ${d.name}?`;
    if (!window.confirm(msg)) return;
    try {
      await api.patch(`/departments/${d._id}`, { status: next });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  const control = 'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold outline-none ring-role focus:ring-2';

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Departments"
        subtitle="Organize your company into departments and see how many people are in each."
        workspace="Admin Workspace"
        action={
          <button
            onClick={() => setModal({})}
            className="flex items-center gap-2 rounded-xl bg-role px-5 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus size={18} /> Add department
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total departments" value={departments.length} icon={Building2} tone="blue" />
        <StatCard label="Active" value={active} icon={CheckCircle2} tone="green" />
        <StatCard label="Inactive" value={departments.length - active} icon={XCircle} tone="orange" />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments…"
              className="w-full rounded-xl bg-page py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-role focus:ring-2"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${control} bg-page`}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error ? (
          <p className="py-8 text-center text-sm font-medium text-accent">{error}</p>
        ) : loading ? (
          <Empty>Loading departments…</Empty>
        ) : filtered.length === 0 ? (
          <Empty>{departments.length === 0 ? 'No departments yet. Add your first one.' : 'No departments match your search.'}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-page">
                <tr>
                  <th className={th}>Department</th>
                  <th className={th}>Description</th>
                  <th className={th}>Employees</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d._id} className="border-b border-black/5 last:border-0">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-role/10 text-role">
                          <Building2 size={18} />
                        </div>
                        <p className="font-bold">{d.name}</p>
                      </div>
                    </td>
                    <td className={`${td} max-w-xs text-black/60`}>
                      <p className="line-clamp-2">{d.description || '—'}</p>
                    </td>
                    <td className={`${td} font-extrabold`}>{d.employeeCount ?? 0}</td>
                    <td className={td}>
                      <StatusBadge status={d.status} />
                    </td>
                    <td className={td}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setModal({ department: d })}
                          className="flex items-center gap-1.5 rounded-full bg-page px-3.5 py-1.5 text-xs font-bold hover:bg-black/10"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => toggle(d)}
                          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                            d.status === 'active'
                              ? 'bg-accent/10 text-accent hover:bg-accent/20'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power size={13} /> {d.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal.department ? 'Edit department' : 'Add department'} onClose={() => setModal(null)}>
          <DepartmentForm
            department={modal.department}
            existing={departments}
            onCancel={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              load();
            }}
          />
        </Modal>
      )}
    </main>
  );
}