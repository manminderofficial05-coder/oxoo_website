import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  Fingerprint,
  Image as ImageIcon,
  Landmark,
  Loader2,
  CreditCard,
  Lock,
  Trash2,
  Upload,
} from 'lucide-react';
import api from '../api/axios';
import { Card } from './dash';
import { fmtDate } from '../utils/format';

const MB = 1024 * 1024;
const ALL = ['application/pdf', 'image/jpeg', 'image/png'];

// Keep the limits in step with server/controllers/documentController.js
const DOCS = [
  { key: 'photo', label: 'Passport photo', hint: 'JPG or PNG, up to 2 MB', icon: ImageIcon, types: ['image/jpeg', 'image/png'], maxMB: 2 },
  { key: 'aadhaar', label: 'Aadhaar card', hint: 'PDF, JPG or PNG, up to 5 MB', icon: Fingerprint, types: ALL, maxMB: 5 },
  { key: 'pan', label: 'PAN card', hint: 'PDF, JPG or PNG, up to 5 MB', icon: CreditCard, types: ALL, maxMB: 5 },
  { key: 'bank', label: 'Bank passbook / cancelled cheque', hint: 'PDF, JPG or PNG, up to 5 MB', icon: Landmark, types: ALL, maxMB: 5 },
  { key: 'other', label: 'Other document', hint: 'PDF, JPG or PNG, up to 5 MB', icon: FileText, types: ALL, maxMB: 5 },
];

const fmtSize = (bytes) => (bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(Math.round(bytes / 1024), 1)} KB`);

const smallBtn =
  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold disabled:opacity-50';

function DocTile({ spec, doc, thumb, canUpload, busy, anyBusy, onPick, onView, onDownload, onRemove }) {
  const input = useRef(null);
  const Icon = spec.icon;
  const isPhoto = spec.key === 'photo';

  return (
    <div className="flex flex-col rounded-2xl border border-black/5 bg-page/50 p-4">
      <div className="flex items-start gap-3">
        {isPhoto && doc ? (
          thumb ? (
            <img src={thumb} alt="Passport photo" className="h-20 w-16 shrink-0 rounded-lg object-cover ring-1 ring-black/10" />
          ) : (
            <div className="h-20 w-16 shrink-0 animate-pulse rounded-lg bg-black/10" />
          )
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-role/10 text-role">
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-snug">{spec.label}</p>
          {doc ? (
            <>
              <p className="mt-0.5 truncate text-xs font-semibold text-black/70" title={doc.originalName}>
                {doc.originalName}
              </p>
              <p className="text-[11px] text-black/45">
                {fmtSize(doc.size)} · Uploaded {fmtDate(doc.uploadedAt)}
              </p>
            </>
          ) : (
            <p className="mt-0.5 text-xs italic text-black/35">Not uploaded · {spec.hint}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {doc && (
          <>
            <button onClick={onView} disabled={anyBusy} className={`${smallBtn} bg-white ring-1 ring-black/10 hover:bg-surface`}>
              <Eye size={13} /> View
            </button>
            <button onClick={onDownload} disabled={anyBusy} className={`${smallBtn} bg-white ring-1 ring-black/10 hover:bg-surface`}>
              <Download size={13} /> Download
            </button>
          </>
        )}
        {canUpload && (
          <button onClick={() => input.current?.click()} disabled={anyBusy} className={`${smallBtn} bg-role text-white hover:opacity-90`}>
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {busy ? 'Working…' : doc ? 'Replace' : 'Upload'}
          </button>
        )}
        {canUpload && doc && (
          <button onClick={onRemove} disabled={anyBusy} className={`${smallBtn} text-accent hover:bg-accent/10`}>
            <Trash2 size={13} /> Remove
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept={spec.types.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // lets the same file be chosen again
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

// Admin or the employee themselves only (the server enforces this too).
export default function DocumentsCard({ employee, isAdmin, isSelf, onUpdated }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [thumb, setThumb] = useState('');

  const docs = employee.documents || {};
  const locked = !!employee.hrDetails?.locked;
  const canUpload = isAdmin || (isSelf && !locked);
  const base = `/employees/${employee._id}/documents`;
  const photoStamp = docs.photo?.uploadedAt || '';

  // Thumbnail: a short-lived signed link, refreshed whenever the photo changes
  useEffect(() => {
    let alive = true;
    setThumb('');
    if (!photoStamp) return undefined;
    api
      .get(`${base}/photo`)
      .then(({ data }) => alive && setThumb(data.url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [base, photoStamp]);

  if (!isAdmin && !isSelf) return null;

  const upload = async (spec, file) => {
    setError('');
    if (!spec.types.includes(file.type)) return setError(`${spec.label}: ${spec.hint}.`);
    if (file.size > spec.maxMB * MB) return setError(`${spec.label} is too large. ${spec.hint}.`);

    const fd = new FormData();
    fd.append('file', file);
    setBusy(spec.key);
    try {
      const { data } = await api.post(`${base}/${spec.key}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpdated({ ...employee, documents: data.documents });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const view = async (spec) => {
    setError('');
    const tab = window.open('', '_blank'); // opened first so the browser doesn't block it
    try {
      const { data } = await api.get(`${base}/${spec.key}`);
      if (tab) tab.location.href = data.url;
      else window.open(data.url, '_blank');
    } catch (err) {
      tab?.close();
      setError(err.response?.data?.message || 'Could not open the file');
    }
  };

  const download = async (spec) => {
    setError('');
    try {
      const { data } = await api.get(`${base}/${spec.key}`, { params: { download: 1 } });
      const a = document.createElement('a');
      a.href = data.url;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not download the file');
    }
  };

  const remove = async (spec) => {
    if (!window.confirm(`Remove the ${spec.label.toLowerCase()}? This deletes the file.`)) return;
    setError('');
    setBusy(spec.key);
    try {
      const { data } = await api.delete(`${base}/${spec.key}`);
      onUpdated({ ...employee, documents: data.documents });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove the file');
    } finally {
      setBusy('');
    }
  };

  const uploaded = DOCS.filter((d) => docs[d.key]?.uploadedAt).length;

  return (
    <Card
      title="Documents"
      subtitle={`${uploaded} of ${DOCS.length} uploaded · stored privately, visible only to HR and the employee`}
    >
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {locked && !isAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          <Lock size={14} /> Documents are locked. Contact HR to make changes.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DOCS.map((spec) => (
          <DocTile
            key={spec.key}
            spec={spec}
            doc={docs[spec.key]?.uploadedAt ? docs[spec.key] : null}
            thumb={spec.key === 'photo' ? thumb : ''}
            canUpload={canUpload}
            busy={busy === spec.key}
            anyBusy={!!busy}
            onPick={(file) => upload(spec, file)}
            onView={() => view(spec)}
            onDownload={() => download(spec)}
            onRemove={() => remove(spec)}
          />
        ))}
      </div>

      {employee.hrDetails?.photoUrl && (
        <p className="mt-4 text-xs text-black/45">
          Older passport photo link on file:{' '}
          <a href={employee.hrDetails.photoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-role hover:underline">
            open link
          </a>
          . Upload a photo above to replace it.
        </p>
      )}
    </Card>
  );
}