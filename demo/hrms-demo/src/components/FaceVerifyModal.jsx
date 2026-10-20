import { useEffect, useRef, useState } from 'react';
import { Camera, ScanFace } from 'lucide-react';
import { capturePhoto, captureOnce, loadFaceApi, startCamera, stopCamera } from '../utils/faceScan';

// onDone({ faceDescriptor, liveness: false, photo }) on success, onDone(null) if cancelled
export default function FaceVerifyModal({ onDone }) {
  const videoRef = useRef(null);
  const [message, setMessage] = useState('Starting camera…');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let stream = null;
    setError('');
    setReady(false);
    setCapturing(false);

    (async () => {
      try {
        setMessage('Loading face models…');
        await loadFaceApi();
        stream = await startCamera(videoRef.current, () => cancelled);
        if (!stream || cancelled) return;
        setMessage('Look at the camera and press Capture');
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Camera error');
      }
    })();

    return () => {
      cancelled = true;
      stopCamera(stream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const capture = async () => {
    setCapturing(true);
    setError('');
    try {
      const { descriptor } = await captureOnce(videoRef.current);
      const photo = capturePhoto(videoRef.current);
      onDone({ faceDescriptor: descriptor, liveness: false, photo });
    } catch (err) {
      setCapturing(false);
      setError(err.message || 'Could not find your face clearly. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <ScanFace size={22} className="text-role" />
          <h2 className="text-lg font-extrabold">Face check</h2>
        </div>

        <div className="overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full -scale-x-100 object-cover" />
        </div>

        {error ? (
          <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</p>
        ) : (
          <p className="text-center text-sm font-bold text-black/70">{capturing ? 'Checking…' : message}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onDone(null)}
            disabled={capturing}
            className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10 disabled:opacity-50"
          >
            Cancel
          </button>
          {error ? (
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="rounded-full bg-role px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              Try again
            </button>
          ) : (
            <button
              onClick={capture}
              disabled={!ready || capturing}
              className="flex items-center gap-2 rounded-full bg-role px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Camera size={16} /> {capturing ? 'Capturing…' : 'Capture'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}