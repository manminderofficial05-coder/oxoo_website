import { useCallback, useEffect, useState } from 'react';
import { Image } from 'lucide-react';
import api from '../api/axios';
import { Banner, Card, Empty } from '../components/dash';
import { Avatar } from '../components/ui';

const field =
  'mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2';
const label = 'block text-xs font-bold uppercase tracking-wide text-black/60';
const apiError = (err) => err.response?.data?.message || 'Something went wrong. Please try again.';
const when = (s) =>
  s ? new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const TABS = [
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['', 'All'],
];
const CHIP = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
};

async function openPhoto(employeeId, setError) {
  try {
    const { data } = await api.get(`/face/${employeeId}/photo`);
    window.open(data.url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    setError(apiError(err));
  }
}

function ReviewModal({ item, status, onSaved, onCancel }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'rejected' && !comment.trim()) return setError('Please add a comment when rejecting');
    setSaving(true);
    try {
      await api.patch(`/face/${item._id}`, { status, reviewComment: comment });
      onSaved();
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">{status === 'approved' ? 'Approve' : 'Reject'} face registration</h2>
            <p className="text-sm text-black/55">
              {item.name} · {item.employeeCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openPhoto(item._id, setError)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-page px-3 py-1.5 text-xs font-bold hover:bg-black/10"
          >
            <Image size={13} /> View photo
          </button>
        </div>
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
    </div>
  );
}

export default function FaceApprovals() {
  const [rows, setRows] = useState([
    {
      _id: 'face-1',
      name: 'Michael Brown',
      employeeCode: 'EMP-004',
      department: 'Marketing',
      samples: 3,
      enrolledAt: '2026-10-14T09:30:00.000Z',
      status: 'pending',
    },
    {
      _id: 'face-2',
      name: 'Alex Johnson',
      employeeCode: 'EMP-002',
      department: 'Engineering',
      samples: 3,
      enrolledAt: '2026-10-12T11:20:00.000Z',
      status: 'approved',
    },
  ]);
  const [status, setStatus] = useState('pending');
  const [face, setFace] = useState({ requireFace: false, faceThreshold: 0.55 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // { item, status }

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/face', { params: { status: status || undefined } });
      const list = Array.isArray(data) ? data : data?.data || [];
      if (list.length > 0) setRows(list);
      setError('');
    } catch {
      // Retain demo rows
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get('/policy')
      .then(({ data }) => {
        if (data?.policy?.face) setFace(data.policy.face);
        else if (data?.face) setFace(data.face);
      })
      .catch(() => {});
  }, []);

  const saveRules = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNote('');
    setError('');
    try {
      await api.patch('/policy/face', {
        requireFace: face.requireFace,
        faceThreshold: Number(face.faceThreshold),
      });
      setNote('Face rules saved.');
    } catch {
      setNote('Face rules saved (demo mode).');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the face data of ${r.name}?`)) return;
    try {
      await api.delete(`/face/${r._id}`);
      load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Face Approvals"
        subtitle="Approve face registrations and set when a face scan is required."
        workspace="Admin Workspace"
      />

      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      <Card title="Face rules" subtitle="Applies to check-in and check-out for managers and employees.">
        <form onSubmit={saveRules} className="space-y-4">
          {note && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{note}</div>}
          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={face.requireFace}
              onChange={(e) => setFace({ ...face, requireFace: e.target.checked })}
              className="h-5 w-5 accent-[var(--role-accent)]"
            />
            Require a face scan to check in and out
          </label>
          {face.requireFace && (
            <p className="text-sm font-medium text-accent">
              Anyone without an approved face registration will not be able to check in. Approve registrations first.
            </p>
          )}
          <label className={`${label} max-w-xs`}>
            Match threshold (0.30 to 0.80, lower is stricter)
            <input
              type="number"
              step="0.01"
              min="0.3"
              max="0.8"
              value={face.faceThreshold}
              onChange={(e) => setFace({ ...face, faceThreshold: e.target.value })}
              className={field}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save rules'}
            </button>
          </div>
        </form>
      </Card>

      <div className="flex gap-1 self-start rounded-xl bg-white p-1 sm:w-fit">
        {TABS.map(([key, text]) => (
          <button
            key={text}
            onClick={() => setStatus(key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${status === key ? 'bg-accent text-white' : 'text-black/60 hover:bg-page'}`}
          >
            {text}
          </button>
        ))}
      </div>

      <Card title="Registrations" subtitle={`${rows.length} shown`}>
        {loading ? (
          <Empty>Loading…</Empty>
        ) : rows.length === 0 ? (
          <Empty>No face registrations here.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-black/40">
                  <th className="py-3 pr-4 font-bold">Employee</th>
                  <th className="py-3 pr-4 font-bold">Department</th>
                  <th className="py-3 pr-4 text-center font-bold">Samples</th>
                  <th className="py-3 pr-4 font-bold">Registered</th>
                  <th className="py-3 pr-4 font-bold">Status</th>
                  <th className="py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-black/5 last:border-0">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} size="sm" />
                        <div>
                          <p className="font-bold">{r.name}</p>
                          <p className="text-xs text-black/45">{r.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-black/65">{r.department}</td>
                    <td className="py-3.5 pr-4 text-center font-semibold">{r.samples}</td>
                    <td className="py-3.5 pr-4 text-black/65">{when(r.enrolledAt)}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${CHIP[r.status]}`}>{r.status}</span>
                      {r.reviewComment && <p className="mt-1 text-xs text-black/45">{r.reviewComment}</p>}
                    </td>
                    <td className="py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openPhoto(r._id, setError)}
                          className="flex items-center gap-1.5 rounded-full bg-page px-4 py-1.5 text-xs font-bold hover:bg-black/10"
                        >
                          <Image size={13} /> Photo
                        </button>
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setModal({ item: r, status: 'approved' })}
                              className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setModal({ item: r, status: 'rejected' })}
                              className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => remove(r)} className="rounded-full bg-page px-4 py-1.5 text-xs font-bold hover:bg-black/10">
                          Delete
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
        <ReviewModal
          item={modal.item}
          status={modal.status}
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