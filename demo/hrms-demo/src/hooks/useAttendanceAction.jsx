import { useState } from 'react';
import api from '../api/axios';
import FaceVerifyModal from '../components/FaceVerifyModal';
import { getPosition, locationBody, locationHint } from '../utils/location';

/**
 * run('check-in' | 'check-out'): face scan (when HR requires it) -> GPS -> POST.
 * busy: '' | 'face' | 'locating' | 'saving'. Render {faceModal} somewhere in your JSX.
 */
export default function useAttendanceAction({ onSuccess, onFailure } = {}) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [scan, setScan] = useState(null);

  const askFace = () => new Promise((resolve) => setScan({ resolve }));

  const run = async (kind) => {
    setError('');
    try {
      const { requireFace } = await api
        .get('/face/requirements')
        .then((r) => r.data)
        .catch(() => ({}));

      let face = {};
      if (requireFace) {
        setBusy('face');
        const result = await askFace();
        setScan(null);
        if (!result) return; // cancelled
        face = result;
      }

      setBusy('locating');
      const pos = await getPosition();
      setBusy('saving');
      try {
        const { data } = await api.post(`/attendance/${kind}`, { ...locationBody(pos), ...face });
        onSuccess?.(data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
        setError(msg + (pos && !pos.error ? '' : locationHint(pos)));
        onFailure?.(err);
      }
    } finally {
      setBusy('');
    }
  };

  const faceModal = scan ? <FaceVerifyModal onDone={(result) => scan.resolve(result)} /> : null;
  return { run, busy, error, faceModal };
}