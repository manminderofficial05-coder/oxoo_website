import { useCallback, useEffect, useState } from 'react';
import { Pencil, Wallet } from 'lucide-react';
import api from '../api/axios';
import { Card } from './dash';
import { Modal } from './ui';
import { fmtDate, fmtMoney, localToday } from '../utils/format';

const field =
  'mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2';
const label = 'block text-xs font-bold uppercase tracking-wide text-black/60';

function SalaryForm({ employeeId, current, onSaved, onCancel }) {
  const [form, setForm] = useState({
    monthlySalary: current ? String(current / 100) : '',
    effectiveFrom: localToday(),
    note: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.monthlySalary);
    if (!(amount > 0)) return setError('Enter a monthly salary above 0');
    if (!form.effectiveFrom) return setError('Choose the date this salary starts');
    setSaving(true);
    setError('');
    try {
      await api.put(`/payroll/salary/${employeeId}`, {
        monthlySalary: amount,
        effectiveFrom: form.effectiveFrom,
        note: form.note,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the salary');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}
      <label className={label}>
        Monthly salary (₹)
        <input
          type="number"
          min="1"
          step="0.01"
          name="monthlySalary"
          value={form.monthlySalary}
          onChange={set}
          className={field}
          autoFocus
        />
      </label>
      <label className={label}>
        Effective from
        <input type="date" name="effectiveFrom" value={form.effectiveFrom} onChange={set} className={field} />
      </label>
      <label className={label}>
        Note (optional)
        <input name="note" value={form.note} onChange={set} maxLength={200} placeholder="e.g. Annual increment" className={field} />
      </label>
      <p className="text-xs font-medium text-black/45">
        Payroll for a month uses the salary in force on the last day of that month. Earlier months are not changed.
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
          Cancel
        </button>
        <button
          disabled={saving}
          className="rounded-full bg-role px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save salary'}
        </button>
      </div>
    </form>
  );
}

// Admin only. The server also refuses everyone else (403).
export default function SalaryCard({ employeeId }) {
  const [salary, setSalary] = useState(undefined); // undefined = loading, null = not set yet
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const load = useCallback(
    () =>
      api
        .get(`/payroll/salary/${employeeId}`)
        .then(({ data }) => setSalary(data.salary))
        .catch((err) => setError(err.response?.data?.message || 'Could not load salary')),
    [employeeId]
  );

  useEffect(() => {
    setSalary(undefined);
    setError('');
    load();
  }, [load]);

  const history = [...(salary?.history || [])].sort(
    (a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom) || new Date(b.changedAt) - new Date(a.changedAt)
  );

  return (
    <Card
      title="Salary"
      subtitle="Visible to admin only"
      action={
        salary !== undefined && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-role px-4 py-2 text-xs font-bold text-white hover:opacity-90"
          >
            <Pencil size={13} /> {salary ? 'Change salary' : 'Set salary'}
          </button>
        )
      }
    >
      {error ? (
        <p className="text-sm font-medium text-accent">{error}</p>
      ) : salary === undefined ? (
        <p className="text-sm text-black/40">Loading…</p>
      ) : salary === null ? (
        <p className="text-sm font-medium text-black/50">No salary set yet. Payroll skips this employee until one is set.</p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-role/10 text-role">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-3xl font-extrabold leading-tight">{fmtMoney(salary.monthlySalary)}</p>
              <p className="text-xs text-black/45">per month · from {fmtDate(salary.effectiveFrom)}</p>
            </div>
          </div>

          <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-black/40">History</h3>
          <ul className="divide-y divide-black/5 text-sm">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-bold">{fmtMoney(h.monthlySalary)}</p>
                  {h.note && <p className="truncate text-xs text-black/45">{h.note}</p>}
                </div>
                <span className="whitespace-nowrap text-xs font-semibold text-black/50">from {fmtDate(h.effectiveFrom)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {open && (
        <Modal title={salary ? 'Change salary' : 'Set salary'} onClose={() => setOpen(false)}>
          <SalaryForm
            employeeId={employeeId}
            current={salary?.monthlySalary}
            onCancel={() => setOpen(false)}
            onSaved={() => {
              setOpen(false);
              load();
            }}
          />
        </Modal>
      )}
    </Card>
  );
}