import { LogIn, LogOut } from 'lucide-react';
import useAttendanceAction from '../hooks/useAttendanceAction';

// Quick-action style button. `today` is the dashboard's "today" object.
export default function CheckInButton({ today, onDone }) {
  // Always re-sync with the server afterwards (also fixes stale state after a 409)
  const { run, busy, error, faceModal } = useAttendanceAction({ onSuccess: onDone, onFailure: onDone });

  const checkedIn = !!today?.checkIn;
  const checkedOut = !!today?.checkOut;

  if (checkedOut) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-4">
        <p className="text-sm font-bold text-emerald-700">Attendance recorded</p>
        <p className="text-xs text-emerald-700/70">You have checked out for today</p>
      </div>
    );
  }

  const Icon = checkedIn ? LogOut : LogIn;
  const label =
    busy === 'face' ? 'Scanning face…' : busy === 'locating' ? 'Getting location…' : busy ? 'Please wait…' : checkedIn ? 'Check Out' : 'Check In';

  return (
    <div>
      <button
        onClick={() => run(checkedIn ? 'check-out' : 'check-in')}
        disabled={!!busy}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-white hover:opacity-90 disabled:opacity-60 ${
          checkedIn ? 'bg-accent' : 'bg-role'
        }`}
      >
        <Icon size={20} />
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-white/70">{checkedIn ? 'End your workday' : 'Start your workday'}</p>
        </div>
      </button>
      {error && <p className="mt-2 text-xs font-medium text-accent">{error}</p>}
      {faceModal}
    </div>
  );
}