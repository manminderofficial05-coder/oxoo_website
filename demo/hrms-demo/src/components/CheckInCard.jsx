import { useEffect, useState } from 'react';
import { Home, LogIn, LogOut, MapPin } from 'lucide-react';
import api from '../api/axios';
import { Card } from './dash';
import { fmtDuration, fmtTime } from '../utils/format';
import useAttendanceAction from '../hooks/useAttendanceAction';

export default function CheckInCard({ onChange }) {
  const [now, setNow] = useState(new Date());
  const [record, setRecord] = useState(null);
  const [wfh, setWfh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadToday = () =>
    api
      .get('/attendance/today')
      .then(({ data }) => {
        setRecord(data.record);
        setWfh(!!data.wfh);
      })
      .catch(() => setLoadError('Could not load today’s status'))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadToday();
  }, []);

  const { run, busy, error, faceModal } = useAttendanceAction({
    onSuccess: (data) => {
      setRecord(data.record);
      onChange?.();
    },
    onFailure: () => loadToday(), // re-sync with the server (e.g. after a 409)
  });

  const checkedIn = !!record?.checkIn;
  const checkedOut = !!record?.checkOut;
  const isWfh = record ? record.workMode === 'wfh' : wfh;
  const elapsedMins = checkedIn && !checkedOut ? Math.max(Math.floor((now - new Date(record.checkIn)) / 60000), 0) : null;

  let statusText = 'You have not checked in yet';
  if (checkedIn && !checkedOut) statusText = `Working · ${fmtDuration(elapsedMins)} so far`;
  if (checkedOut) statusText = `Done for today · ${fmtDuration(Math.round(record.hours * 60))}`;

  const loc = record?.checkInLocation;
  const doing = (idle, active) =>
    busy === 'face' ? 'Scanning face…' : busy === 'locating' ? 'Getting location…' : busy ? active : idle;

  return (
    <Card
      title="Today"
      subtitle={now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      action={
        isWfh && (
          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
            <Home size={13} /> Work from home
          </span>
        )
      }
    >
      <p className="text-4xl font-extrabold tabular-nums">
        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="mt-1 text-sm font-semibold text-black/55">{loading ? 'Loading…' : statusText}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-page p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-black/40">Check in</p>
          <p className="mt-0.5 font-extrabold">{fmtTime(record?.checkIn)}</p>
        </div>
        <div className="rounded-xl bg-page p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-black/40">Check out</p>
          <p className="mt-0.5 font-extrabold">{fmtTime(record?.checkOut)}</p>
        </div>
      </div>

      {checkedOut && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          {[
            ['Late', record.lateMinutes, 'text-blue-600'],
            ['Early out', record.earlyLeaveMinutes, 'text-orange-600'],
            ['Overtime', record.overtimeMinutes, 'text-emerald-700'],
          ].map(([name, m, cls]) => (
            <div key={name} className="rounded-xl bg-page py-2">
              <p className="font-bold text-black/40">{name}</p>
              <p className={`mt-0.5 font-extrabold ${cls}`}>{m > 0 ? fmtDuration(m) : '—'}</p>
            </div>
          ))}
        </div>
      )}

      {loc?.distance != null && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-black/45">
          <MapPin size={13} /> Checked in {loc.distance} m from the office
        </p>
      )}

      {(error || loadError) && <p className="mt-3 text-sm font-medium text-accent">{error || loadError}</p>}

      <div className="mt-4">
        {!checkedIn && (
          <button
            disabled={!!busy || loading}
            onClick={() => run('check-in')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-role px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            <LogIn size={18} /> {doing('Check in', 'Checking in…')}
          </button>
        )}
        {checkedIn && !checkedOut && (
          <button
            disabled={!!busy}
            onClick={() => run('check-out')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            <LogOut size={18} /> {doing('Check out', 'Checking out…')}
          </button>
        )}
        {checkedOut && (
          <p className="rounded-full bg-emerald-50 px-5 py-3 text-center text-sm font-bold text-emerald-700">
            Attendance recorded for today
          </p>
        )}
      </div>
      {faceModal}
    </Card>
  );
}