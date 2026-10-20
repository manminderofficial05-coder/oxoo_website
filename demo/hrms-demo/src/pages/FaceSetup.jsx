import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Image, ScanFace, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner, Card } from '../components/dash';
import { capturePhoto, captureSamples, loadFaceApi, startCamera, stopCamera } from '../utils/faceScan';
import { APP_NAME } from '../config/brand';

const STEPS = ['Look straight at the camera', 'Turn your head slightly left', 'Turn your head slightly right', 'Look straight again'];
const R = 47;
const CIRC = 2 * Math.PI * R;

const STATUS = {
  none: ['Not registered', 'bg-black/10 text-black/60'],
  pending: ['Waiting for HR approval', 'bg-amber-50 text-amber-700'],
  approved: ['Registered and approved', 'bg-emerald-50 text-emerald-700'],
  rejected: ['Rejected by HR', 'bg-red-50 text-red-600'],
};

const PRIVACY = [
  'A reference photo and a numeric face template are stored for your registration.',
  'Your registration photo is visible to you and to HR when reviewing it.',
  'HR approves it before it is used.',
  'You can delete it at any time.',
];

export default function FaceSetup() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [info, setInfo] = useState({ status: 'none', reviewComment: '' });
  const [consent, setConsent] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);

  const loadStatus = useCallback(
    () =>
      api
        .get('/face/me')
        .then(({ data }) => setInfo(data))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!capturing) return undefined;
    let cancelled = false;
    let stream = null;

    (async () => {
      try {
        setMessage('Loading face models…');
        await loadFaceApi();
        stream = await startCamera(videoRef.current, () => cancelled);
        if (!stream || cancelled) return;

        const descriptors = await captureSamples(videoRef.current, STEPS.length, {
          onStatus: (m) => !cancelled && setMessage(m),
          onProgress: (n) => !cancelled && setProgress(n),
          shouldStop: () => cancelled,
        });
        const photo = capturePhoto(videoRef.current);
        await api.post('/face/enroll', { consent: true, descriptors, photo });
        if (!cancelled) {
          setCapturing(false);
          setConsent(false);
          loadStatus();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Registration failed');
          setCapturing(false);
        }
      } finally {
        stopCamera(stream);
      }
    })();

    return () => {
      cancelled = true;
      stopCamera(stream);
    };
  }, [capturing, loadStatus]);

  const start = () => {
    setError('');
    setProgress(0);
    setCapturing(true);
  };

  const remove = async () => {
    if (!window.confirm('Delete your registered face data?')) return;
    try {
      await api.delete('/face/me');
      setProgress(0);
      loadStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete');
    }
  };

  const viewPhoto = async () => {
    setPhotoBusy(true);
    setError('');
    try {
      const { data } = await api.get('/face/me/photo');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open your photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  const [statusLabel, statusCls] = STATUS[info.status] || STATUS.none;
  const registered = info.status !== 'none';
  const approved = info.status === 'approved';
  const workspace = `${user.role === 'manager' ? 'Manager' : 'Employee'} Workspace`;

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Face ID setup"
        subtitle="Register your face once. It is used to verify you when you check in and out."
        workspace={workspace}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live camera */}
        <Card title="Camera" subtitle={capturing ? 'Stay in the frame and follow the prompts' : 'Camera is off'}>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" strokeWidth="2.5" className="stroke-black/10" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="stroke-emerald-500 transition-all duration-500"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - (capturing ? progress : registered ? STEPS.length : 0) / STEPS.length)}
              />
            </svg>

            <div className="absolute inset-3 overflow-hidden rounded-full bg-slate-900">
              <video
                ref={videoRef}
                muted
                playsInline
                className={`h-full w-full -scale-x-100 object-cover ${capturing ? '' : 'invisible'}`}
              />
              {!capturing && (
                <div className="absolute inset-0 grid place-items-center bg-slate-100 text-black/35">
                  {approved ? (
                    <ShieldCheck size={72} className="text-emerald-500" />
                  ) : (
                    <ScanFace size={72} />
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="mt-5 min-h-6 text-center text-base font-extrabold">
            {capturing ? message : registered ? statusLabel : 'Ready when you are'}
          </p>
          {capturing && (
            <p className="mt-1 text-center text-xs font-semibold text-black/45">
              Step {Math.min(progress + 1, STEPS.length)} of {STEPS.length}
            </p>
          )}
        </Card>

        {/* Steps, privacy, actions */}
        <div className="space-y-6">
          <Card title="Status">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusCls}`}>
                <ScanFace size={14} /> {statusLabel}
              </span>
              {registered && !capturing && (
                <button
                  onClick={viewPhoto}
                  disabled={photoBusy}
                  className="flex items-center gap-1.5 rounded-full bg-page px-3 py-1 text-xs font-bold hover:bg-black/10 disabled:opacity-60"
                >
                  <Image size={13} /> {photoBusy ? 'Opening…' : 'View my photo'}
                </button>
              )}
            </div>
            {info.status === 'rejected' && info.reviewComment && (
              <p className="mt-2 text-sm text-black/60">HR comment: {info.reviewComment}</p>
            )}
            {info.status === 'pending' && (
              <p className="mt-2 text-sm text-black/60">
                Your registration was sent. You can check in with your face once HR approves it.
              </p>
            )}

            <ol className="mt-5 space-y-3">
              {STEPS.map((label, i) => {
                const done = capturing ? i < progress : registered;
                const current = capturing && i === progress;
                return (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                        done
                          ? 'bg-emerald-500 text-white'
                          : current
                          ? 'bg-role text-white ring-4 ring-role/20'
                          : 'bg-black/10 text-black/45'
                      }`}
                    >
                      {done ? <Check size={14} /> : i + 1}
                    </span>
                    <span className={current ? 'font-bold' : 'font-medium text-black/60'}>{label}</span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Your privacy">
            <ul className="space-y-2.5">
              {PRIVACY.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-black/65">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>

            {error && <p className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-sm font-medium text-accent">{error}</p>}

            {capturing ? (
              <button
                onClick={() => setCapturing(false)}
                className="mt-5 w-full rounded-full bg-page py-3 text-sm font-semibold hover:bg-black/10"
              >
                Cancel
              </button>
            ) : (
              <div className="mt-5 space-y-3">
                {approved && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700">
                    <ShieldCheck size={15} /> Face ID verified — ready for check-in
                  </div>
                )}

                <label className="flex items-start gap-2.5 text-sm text-black/65">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-emerald-600"
                  />
                  I agree that {APP_NAME} stores a reference photo and a numeric face template to verify my attendance.
                </label>

                {!registered ? (
                  <button
                    onClick={start}
                    disabled={!consent}
                    className="w-full rounded-full bg-role py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Start registration
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={start}
                      disabled={!consent}
                      className="flex-1 rounded-full bg-page py-2 text-xs font-bold text-black/65 hover:bg-black/10 disabled:opacity-50"
                    >
                      Register again
                    </button>
                    <button
                      onClick={remove}
                      className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}