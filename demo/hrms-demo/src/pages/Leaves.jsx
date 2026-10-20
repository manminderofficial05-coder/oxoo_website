import { useCallback, useEffect, useState } from 'react';
import { CalendarPlus, Check, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner, Card, Empty, Pill } from '../components/dash';
import { Avatar, Modal } from '../components/ui';
import { fmtShort } from '../utils/format';

const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Mon–Fri days between two YYYY-MM-DD strings (inclusive)
function weekdays(s, e) {
  if (!s || !e || e < s) return 0;
  let n = 0;
  const d = new Date(`${s}T00:00:00Z`);
  const end = new Date(`${e}T00:00:00Z`);
  for (; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}

const field = 'mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2';
const label = 'block text-xs font-bold uppercase tracking-wide text-black/60';
const th = 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-black/40';
const td = 'px-4 py-3.5 align-top';

function RequestForm({ balances, onSaved, onCancel }) {
  const [form, setForm] = useState({
    leaveType: balances[0]?.leaveType._id || '',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const bal = balances.find((b) => b.leaveType._id === form.leaveType);
  const days = weekdays(form.startDate, form.endDate);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.leaveType) return setError('Select a leave type');
    if (!form.startDate || !form.endDate) return setError('Choose start and end dates');
    if (form.endDate < form.startDate) return setError('End date cannot be before start date');
    if (form.reason.trim().length < 3) return setError('Please enter a reason');
    if (days < 1) return setError('The selected dates contain no working days');
    if (bal && days > bal.remaining) return setError(`Only ${bal.remaining} day(s) of ${bal.leaveType.name} remaining`);

    setSaving(true);
    setError('');
    try {
      await api.post('/leaves', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      <label className={label}>
        Leave type
        <select name="leaveType" value={form.leaveType} onChange={set} className={field}>
          {balances.map((b) => (
            <option key={b.leaveType._id} value={b.leaveType._id}>
              {b.leaveType.name} ({b.remaining} left)
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          From
          <input type="date" name="startDate" min={todayStr()} value={form.startDate} onChange={set} className={field} />
        </label>
        <label className={label}>
          To
          <input
            type="date"
            name="endDate"
            min={form.startDate || todayStr()}
            value={form.endDate}
            onChange={set}
            className={field}
          />
        </label>
      </div>

      {days > 0 && (
        <p className="rounded-xl bg-role/10 px-4 py-2.5 text-sm font-semibold text-role">
          {days} working {days === 1 ? 'day' : 'days'} (weekends excluded)
        </p>
      )}

      <label className={label}>
        Reason
        <textarea name="reason" rows={3} maxLength={500} value={form.reason} onChange={set} className={field} />
      </label>

      <label className={label}>
        Attachment link (optional)
        <input name="attachment" value={form.attachment} onChange={set} placeholder="https://…" className={field} />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-role px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </form>
  );
}

function ReviewForm({ leave, onSaved, onCancel }) {
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const decide = async (status) => {
    if (status === 'rejected' && !comment.trim()) return setError('Please add a comment when rejecting');
    setBusy(status);
    setError('');
    try {
      await api.patch(`/leaves/${leave._id}`, { status, reviewComment: comment });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the decision');
      setBusy('');
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}
      <div className="rounded-xl bg-page p-4 text-sm">
        <p className="font-extrabold">{leave.employee?.name}</p>
        <p className="mt-1 text-black/60">
          {leave.leaveType?.name} · {fmtShort(leave.startDate)} – {fmtShort(leave.endDate)} ({leave.days}d)
        </p>
        <p className="mt-2 text-black/80">{leave.reason}</p>
        {leave.attachment && (
          <a href={leave.attachment} target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold text-role hover:underline">
            View attachment
          </a>
        )}
      </div>
      <label className={label}>
        Comment (required for rejection)
        <textarea rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} className={field} />
      </label>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
          Cancel
        </button>
        <button
          disabled={!!busy}
          onClick={() => decide('rejected')}
          className="rounded-full bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          {busy === 'rejected' ? 'Rejecting…' : 'Reject'}
        </button>
        <button
          disabled={!!busy}
          onClick={() => decide('approved')}
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy === 'approved' ? 'Approving…' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

const TABS = [
  ['', 'All'],
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
];

export default function Leaves() {
  const { user, employee } = useAuth();
  const role = user.role;
  const showEmployee = role !== 'employee';
  // Admin/HR reviews requests but has no leave of their own
  const myId = role === 'admin' ? undefined : employee?._id;

  const [status, setStatus] = useState(role === 'employee' ? '' : 'pending');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { type: 'request' } | { type: 'review', leave }

  const loadBalances = useCallback(() => {
    if (!myId) return;
    api
      .get('/leaves/balance')
      .then(({ data }) => setBalances(data.balances || []))
      .catch(() => {});
  }, [myId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/leaves', { params: { status: status || undefined, page, limit: 10 } });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load leave requests');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const refresh = () => {
    setModal(null);
    load();
    loadBalances();
  };

  const withdraw = async (l) => {
    if (!window.confirm('Withdraw this leave request?')) return;
    try {
      await api.delete(`/leaves/${l._id}`);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not withdraw');
    }
  };

  const subtitle =
    role === 'employee'
      ? 'Request time off and track your balance and history.'
      : role === 'manager'
      ? 'Review your team’s requests and manage your own leave.'
      : 'Review leave requests across the organization.';

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title={role === 'employee' ? 'Leave Requests' : 'Leaves'}
        subtitle={subtitle}
        workspace={`${role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Employee'} Workspace`}
        action={
          myId && (
            <button
              onClick={() => setModal({ type: 'request' })}
              disabled={balances.length === 0}
              className="flex items-center gap-2 rounded-xl bg-role px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              <CalendarPlus size={18} /> Request leave
            </button>
          )
        }
      />

      {balances.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {balances.map((b) => {
            const usedPct = b.limit ? Math.min(Math.round(((b.used + b.pending) / b.limit) * 100), 100) : 0;
            return (
              <Card key={b.leaveType._id}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-extrabold">{b.leaveType.name}</p>
                  <p className="text-xs font-semibold text-black/45">{b.limit} days / year</p>
                </div>
                <p className="mt-2 text-3xl font-extrabold">
                  {b.remaining} <span className="text-base font-bold text-black/40">left</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-role" style={{ width: `${usedPct}%` }} />
                </div>
                <p className="mt-2 text-xs text-black/45">
                  {b.used} used · {b.pending} pending
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <Card
        title={role === 'employee' ? 'My requests' : 'Requests'}
        action={
          <div className="flex gap-1 rounded-xl bg-page p-1">
            {TABS.map(([value, text]) => (
              <button
                key={text}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  status === value ? 'bg-white shadow-sm' : 'text-black/50 hover:text-black'
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        }
      >
        {error ? (
          <p className="py-8 text-center text-sm font-medium text-accent">{error}</p>
        ) : loading ? (
          <Empty>Loading requests…</Empty>
        ) : result.data.length === 0 ? (
          <Empty>No leave requests found.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-page">
                <tr>
                  {showEmployee && <th className={th}>Employee</th>}
                  <th className={th}>Type</th>
                  <th className={th}>Dates</th>
                  <th className={th}>Reason</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((l) => {
                  const mine = myId && String(l.employee?._id) === String(myId);
                  return (
                    <tr key={l._id} className="border-b border-black/5 last:border-0">
                      {showEmployee && (
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <Avatar name={l.employee?.name || '?'} size="sm" />
                            <div>
                              <p className="font-bold">{l.employee?.name || 'Unknown'}</p>
                              <p className="text-xs text-black/45">{l.employee?.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className={td}>{l.leaveType?.name || '—'}</td>
                      <td className={td}>
                        <p>
                          {fmtShort(l.startDate)} – {fmtShort(l.endDate)}
                        </p>
                        <p className="text-xs text-black/45">
                          {l.days} {l.days === 1 ? 'day' : 'days'}
                        </p>
                      </td>
                      <td className={`${td} max-w-xs`}>
                        <p className="line-clamp-2">{l.reason}</p>
                        {l.reviewComment && (
                          <p className="mt-1 text-xs text-black/45">Reviewer: {l.reviewComment}</p>
                        )}
                      </td>
                      <td className={td}>
                        <Pill status={l.status} />
                      </td>
                      <td className={td}>
                        <div className="flex justify-end gap-2">
                          {l.canReview && (
                            <button
                              onClick={() => setModal({ type: 'review', leave: l })}
                              className="flex items-center gap-1.5 rounded-full bg-role px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90"
                            >
                              <Check size={14} /> Review
                            </button>
                          )}
                          {mine && l.status === 'pending' && (
                            <button
                              onClick={() => withdraw(l)}
                              className="flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={14} /> Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && result.pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/50">
              Page {page} of {result.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-full bg-page px-4 py-2 font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= result.pages}
                onClick={() => setPage(page + 1)}
                className="rounded-full bg-page px-4 py-2 font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {modal?.type === 'request' && (
        <Modal title="Request leave" onClose={() => setModal(null)}>
          <RequestForm balances={balances} onSaved={refresh} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'review' && (
        <Modal title="Review leave request" onClose={() => setModal(null)}>
          <ReviewForm leave={modal.leave} onSaved={refresh} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </main>
  );
}