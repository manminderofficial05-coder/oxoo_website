import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner, Card, Empty, Pill } from '../components/dash';
import { Avatar } from '../components/ui';

const ymd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const field =
  'mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2';
const label = 'block text-xs font-bold uppercase tracking-wide text-black/60';
const apiError = (err) => err.response?.data?.message || 'Something went wrong. Please try again.';
const TABS = [
  ['', 'All'],
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
];

function Backdrop({ children }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">{children}</div>;
}

function RequestModal({ onSaved, onCancel }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return setError('Pick the start and end dates');
    if (form.reason.trim().length < 3) return setError('Add a short reason');
    setSaving(true);
    setError('');
    try {
      await api.post('/work-mode', form);
      onSaved();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Backdrop>
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-7 shadow-2xl">
        <h2 className="text-xl font-extrabold">Request work from home</h2>
        {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            From
            <input type="date" name="startDate" min={ymd()} value={form.startDate} onChange={set} className={field} />
          </label>
          <label className={label}>
            To
            <input type="date" name="endDate" min={form.startDate || ymd()} value={form.endDate} onChange={set} className={field} />
          </label>
        </div>
        <label className={label}>
          Reason
          <textarea name="reason" rows={3} value={form.reason} onChange={set} className={field} />
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </form>
    </Backdrop>
  );
}

function ReviewModal({ request, status, onSaved, onCancel }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'rejected' && !comment.trim()) return setError('Please add a comment when rejecting');
    setSaving(true);
    try {
      await api.patch(`/work-mode/${request._id}`, { status, reviewComment: comment });
      onSaved();
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
    }
  };

  return (
    <Backdrop>
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-7 shadow-2xl">
        <h2 className="text-xl font-extrabold">{status === 'approved' ? 'Approve' : 'Reject'} request</h2>
        <p className="text-sm text-black/55">
          {request.employee?.name} · {day(request.startDate)} – {day(request.endDate)}
        </p>
        {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}
        <label className={label}>
          Comment {status === 'approved' && '(optional)'}
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={field} />
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`rounded-full px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${
              status === 'approved' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {saving ? 'Saving…' : status === 'approved' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </form>
    </Backdrop>
  );
}

export default function WorkMode() {
  const { user } = useAuth();
  const canRequest = user.role !== 'admin';
  const workspace = `${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Employee'} Workspace`;

  const [result, setResult] = useState({ data: [], page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'new' | { request, status }

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/work-mode', { params: { status: status || undefined, page, limit: 10 } });
      const list = Array.isArray(data) ? data : data?.data || [];
      setResult({
        data: list,
        page: data?.page || 1,
        pages: data?.pages || 1,
        total: data?.total || list.length,
      });
      setError('');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const withdraw = async (r) => {
    if (!window.confirm('Withdraw this request?')) return;
    try {
      await api.delete(`/work-mode/${r._id}`);
      load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const done = () => {
    setModal(null);
    load();
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Work Mode"
        subtitle={
          canRequest
            ? 'Ask to work from home, and follow your team’s requests.'
            : 'Review work-from-home requests across the organization.'
        }
        workspace={workspace}
        action={
          canRequest && (
            <button
              onClick={() => setModal('new')}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/25 hover:opacity-90"
            >
              <Plus size={16} /> Request WFH
            </button>
          )
        }
      />

      <div className="flex gap-1 self-start rounded-xl bg-white p-1 sm:w-fit">
        {TABS.map(([key, text]) => (
          <button
            key={key}
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${status === key ? 'bg-accent text-white' : 'text-black/60 hover:bg-page'}`}
          >
            {text}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      <Card title="Requests" subtitle={`${result.total} total`}>
        {loading ? (
          <Empty>Loading requests…</Empty>
        ) : result.data.length === 0 ? (
          <Empty>No work-from-home requests here.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-black/40">
                  <th className="py-3 pr-4 font-bold">Employee</th>
                  <th className="py-3 pr-4 font-bold">Dates</th>
                  <th className="py-3 pr-4 font-bold">Reason</th>
                  <th className="py-3 pr-4 font-bold">Status</th>
                  <th className="py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((r) => {
                  const mine = String(r.employee?._id) === String(user.employeeId || '');
                  return (
                    <tr key={r._id} className="border-b border-black/5 align-top last:border-0">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.employee?.name || '?'} size="sm" />
                          <div>
                            <p className="font-bold">{r.employee?.name}</p>
                            <p className="text-xs text-black/45">{r.employee?.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold">
                          {day(r.startDate)} – {day(r.endDate)}
                        </p>
                        <p className="text-xs text-black/45">
                          {r.days} {r.days === 1 ? 'day' : 'days'}
                        </p>
                      </td>
                      <td className="max-w-xs py-3.5 pr-4 text-black/65">
                        <p>{r.reason}</p>
                        {r.reviewComment && <p className="mt-1 text-xs text-black/45">Reviewer: {r.reviewComment}</p>}
                      </td>
                      <td className="py-3.5 pr-4">
                        <Pill status={r.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          {r.canReview && (
                            <>
                              <button
                                onClick={() => setModal({ request: r, status: 'approved' })}
                                className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setModal({ request: r, status: 'rejected' })}
                                className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {canRequest && r.status === 'pending' && !r.canReview && (
                            <button onClick={() => withdraw(r)} className="rounded-full bg-page px-4 py-1.5 text-xs font-bold hover:bg-black/10">
                              Withdraw
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

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-black/50">
            Page {result.page} of {result.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="grid h-9 w-9 place-items-center rounded-lg bg-page hover:bg-black/10 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= result.pages}
              aria-label="Next page"
              className="grid h-9 w-9 place-items-center rounded-lg bg-page hover:bg-black/10 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>

      {modal === 'new' && <RequestModal onSaved={done} onCancel={() => setModal(null)} />}
      {modal && modal !== 'new' && (
        <ReviewModal request={modal.request} status={modal.status} onSaved={done} onCancel={() => setModal(null)} />
      )}
    </main>
  );
}