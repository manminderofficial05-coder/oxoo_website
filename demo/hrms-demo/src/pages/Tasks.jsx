import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Ban, CalendarDays, CheckCircle2, ClipboardList, Pencil, Play, Plus, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner, Empty, StatCard } from '../components/dash';
import { Avatar } from '../components/ui';

const ymd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayLabel = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const COLUMNS = [
  { key: 'todo', title: 'To do', dot: 'bg-slate-400' },
  { key: 'in-progress', title: 'In progress', dot: 'bg-blue-500' },
  { key: 'done', title: 'Done', dot: 'bg-emerald-500' },
];
const PRIORITY = {
  high: ['High', 'bg-red-50 text-red-600', 'border-l-red-400'],
  medium: ['Medium', 'bg-orange-50 text-orange-600', 'border-l-orange-300'],
  low: ['Low', 'bg-slate-100 text-slate-600', 'border-l-slate-300'],
};
const NEXT = {
  todo: ['in-progress', 'Start', Play],
  'in-progress': ['done', 'Complete', CheckCircle2],
  done: ['todo', 'Reopen', RotateCcw],
};

const field =
  'mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2';
const label = 'block text-xs font-bold uppercase tracking-wide text-black/60';
const control = 'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm outline-none ring-role focus:ring-2';

function TaskModal({ task, assignees, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo?._id || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'medium',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return setError('Title must be at least 3 characters');
    if (!form.assignedTo) return setError('Select who to assign this task to');
    if (!form.dueDate) return setError('Pick a due date');
    setSaving(true);
    setError('');
    try {
      if (task) await api.patch(`/tasks/${task._id}`, form);
      else await api.post('/tasks', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-7 shadow-2xl">
        <h2 className="text-xl font-extrabold">{task ? 'Edit task' : 'Assign a task'}</h2>
        {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

        <label className={label}>
          Title
          <input name="title" value={form.title} onChange={set} className={field} autoFocus />
        </label>
        <label className={label}>
          Description
          <textarea name="description" value={form.description} onChange={set} rows={3} className={field} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Assign to
            <select name="assignedTo" value={form.assignedTo} onChange={set} className={field}>
              <option value="">Select employee</option>
              {assignees.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.employeeCode})
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Due date
            <input type="date" name="dueDate" min={task ? undefined : ymd()} value={form.dueDate} onChange={set} className={field} />
          </label>
        </div>

        <div>
          <span className={label}>Priority</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {Object.entries(PRIORITY).map(([key, [text, cls]]) => (
              <button
                type="button"
                key={key}
                onClick={() => setForm({ ...form, priority: key })}
                className={`rounded-xl py-2.5 text-sm font-bold transition ${
                  form.priority === key ? `${cls} ring-2 ring-role` : 'bg-page text-black/50 hover:bg-black/5'
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/25 hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : task ? 'Save changes' : 'Assign task'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskCard({ task, canAssign, busy, onMove, onEdit, onCancel }) {
  const [pText, pCls, bar] = PRIORITY[task.priority];
  const [nextStatus, nextText, NextIcon] = NEXT[task.status];
  const person = canAssign ? task.assignedTo : task.assignedBy;

  return (
    <div
      className={`rounded-2xl border border-l-4 border-black/5 ${bar} bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-extrabold leading-snug ${task.status === 'done' ? 'text-black/40 line-through' : ''}`}>
          {task.title}
        </p>
        {(task.canEdit || task.canCancel) && (
          <div className="flex shrink-0 gap-1">
            {task.canEdit && (
              <button onClick={() => onEdit(task)} aria-label="Edit task" className="grid h-7 w-7 place-items-center rounded-lg text-black/40 hover:bg-page hover:text-black">
                <Pencil size={14} />
              </button>
            )}
            {task.canCancel && (
              <button onClick={() => onCancel(task)} aria-label="Cancel task" className="grid h-7 w-7 place-items-center rounded-lg text-black/40 hover:bg-accent/10 hover:text-accent">
                <Ban size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && <p className="mt-1.5 line-clamp-2 text-xs text-black/55">{task.description}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${pCls}`}>{pText}</span>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            task.overdue ? 'bg-red-50 text-red-600' : 'bg-page text-black/55'
          }`}
        >
          {task.overdue ? <AlertTriangle size={11} /> : <CalendarDays size={11} />}
          {task.overdue ? 'Overdue · ' : ''}
          {dayLabel(task.dueDate)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/5 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={person?.name || '?'} />
          <p className="truncate text-xs font-semibold text-black/55">
            {canAssign ? 'To ' : 'From '}
            <span className="text-black/80">{person?.name}</span>
          </p>
        </div>
        {task.canMove && (
          <button
            onClick={() => onMove(task, nextStatus)}
            disabled={busy}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-role/10 px-3 py-1.5 text-xs font-bold text-role hover:bg-role/20 disabled:opacity-50"
          >
            <NextIcon size={13} /> {nextText}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const canAssign = user.role === 'admin' || user.role === 'manager';
  const workspace = `${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Employee'} Workspace`;

  const [result, setResult] = useState({ data: [], counts: {} });
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [who, setWho] = useState('');
  const [priority, setPriority] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | task
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setResult(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (canAssign) {
      api.get('/tasks/assignees').then(({ data }) => setAssignees(data.data)).catch(() => {});
    }
  }, [load, canAssign]);

  const move = async (task, status) => {
    setBusyId(task._id);
    try {
      await api.patch(`/tasks/${task._id}`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the task');
    } finally {
      setBusyId('');
    }
  };

  const cancel = async (task) => {
    if (!window.confirm(`Cancel "${task.title}"? It will be removed from the board.`)) return;
    await move(task, 'cancelled');
  };

  const c = result.counts || {};
  const shown = result.data.filter(
    (t) => (!who || t.assignedTo?._id === who) && (!priority || t.priority === priority)
  );

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Tasks"
        subtitle={
          canAssign
            ? 'Assign work to your team and follow its progress.'
            : 'Your assigned work. Move tasks along as you go.'
        }
        workspace={workspace}
        action={
          canAssign && (
            <button
              onClick={() => setModal('new')}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:opacity-90"
            >
              <Plus size={16} /> Assign task
            </button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open" value={(c.todo ?? 0) + (c.inProgress ?? 0)} hint={`${c.inProgress ?? 0} in progress`} icon={ClipboardList} tone="blue" />
        <StatCard label="Overdue" value={c.overdue ?? 0} hint="Past their due date" icon={AlertTriangle} tone="orange" />
        <StatCard label="Completed" value={c.done ?? 0} icon={CheckCircle2} tone="green" />
        <StatCard label="Total" value={c.total ?? 0} icon={CalendarDays} tone="purple" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {canAssign && (
          <select value={who} onChange={(e) => setWho(e.target.value)} className={control}>
            <option value="">Everyone</option>
            {assignees.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={control}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      {loading ? (
        <Empty>Loading tasks…</Empty>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = shown.filter((t) => t.status === col.key);
            return (
              <section key={col.key} className="rounded-3xl bg-black/[0.03] p-3">
                <div className="mb-3 flex items-center justify-between px-2 pt-1">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} /> {col.title}
                  </h2>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-black/50 shadow-sm">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-black/10 py-8 text-center text-xs font-medium text-black/35">
                      Nothing here
                    </p>
                  ) : (
                    items.map((t) => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        canAssign={canAssign}
                        busy={busyId === t._id}
                        onMove={move}
                        onEdit={setModal}
                        onCancel={cancel}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          assignees={assignees}
          onCancel={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </main>
  );
}