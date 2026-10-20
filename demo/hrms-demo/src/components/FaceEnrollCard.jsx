import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanFace, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { Card } from './dash';

const STATUS = {
  none: ['Not registered', 'bg-black/10 text-black/60'],
  pending: ['Waiting for HR approval', 'bg-amber-50 text-amber-700'],
  approved: ['Registered', 'bg-emerald-50 text-emerald-700'],
  rejected: ['Rejected', 'bg-red-50 text-red-600'],
};

export default function FaceEnrollCard() {
  const [info, setInfo] = useState({ status: 'none', reviewComment: '' });
  const [error, setError] = useState('');

  const load = useCallback(
    () =>
      api
        .get('/face/me')
        .then(({ data }) => setInfo(data))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (!window.confirm('Delete your registered face data?')) return;
    setError('');
    try {
      await api.delete('/face/me');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete');
    }
  };

  const [label, cls] = STATUS[info.status] || STATUS.none;

  return (
    <Card title="Face attendance" subtitle="Used to verify check-in and check-out">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
          <ScanFace size={14} /> {label}
        </span>
        {info.status !== 'none' && (
          <button onClick={remove} className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
            <Trash2 size={13} /> Delete my data
          </button>
        )}
      </div>

      {info.status === 'rejected' && info.reviewComment && (
        <p className="mt-2 text-xs text-black/55">HR comment: {info.reviewComment}</p>
      )}
      {error && <p className="mt-3 rounded-xl bg-accent/10 px-3 py-2 text-xs font-medium text-accent">{error}</p>}

      <Link
        to="/face-setup"
        className="mt-4 block w-full rounded-full bg-role py-2.5 text-center text-sm font-bold text-white hover:opacity-90"
      >
        {info.status === 'none' ? 'Set up Face ID' : 'Register again'}
      </Link>
    </Card>
  );
}