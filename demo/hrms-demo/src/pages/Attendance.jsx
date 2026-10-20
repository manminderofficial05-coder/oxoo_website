import { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Image,
  Loader2,
  Timer,
  X,
  XCircle,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner, Card, Empty, StatCard } from '../components/dash';
import { Avatar } from '../components/ui';
import CheckInCard from '../components/CheckInCard';
import { fmtDuration, fmtTime, shortDay } from '../utils/format';

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthOf = (d) => ymd(d).slice(0, 7);
const shiftMonth = (m, delta) => {
  const [y, mo] = m.split('-').map(Number);
  return monthOf(new Date(y, mo - 1 + delta, 1));
};
const monthLabel = (m) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};
const hrs = (h) => (h > 0 ? fmtDuration(Math.round(h * 60)) : '—');
const mn = (m) => (m > 0 ? fmtDuration(m) : '—');

const BADGE = {
  present: ['Present', 'bg-emerald-50 text-emerald-700'],
  late: ['Late', 'bg-blue-50 text-blue-600'],
  'half-day': ['Half-day', 'bg-orange-50 text-orange-600'],
  absent: ['Absent', 'bg-red-50 text-red-600'],
};

const details = (r) =>
  [
    r.checkInLocation?.distance != null && `Checked in ${r.checkInLocation.distance} m from the office`,
    r.faceScoreIn != null && `Face match score in: ${r.faceScoreIn}`,
    r.faceScoreOut != null && `Face match score out: ${r.faceScoreOut}`,
  ]
    .filter(Boolean)
    .join(' · ');

function Badge({ record }) {
  const key = record.status === 'present' && record.late ? 'late' : record.status;
  const [label, cls] = BADGE[key] || BADGE.absent;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" title={details(record)}>
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{label}</span>
      {record.workMode === 'wfh' && (
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">WFH</span>
      )}
      {record.faceScoreIn != null && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Face ✓</span>
      )}
    </span>
  );
}

// Admin-only: small icon next to a time cell that opens the inline photo viewer below.
function PhotoIcon({ onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="ml-1.5 inline-grid h-5 w-5 place-items-center rounded-full bg-page align-middle text-black/45 hover:bg-role/10 hover:text-role"
    >
      <Image size={11} />
    </button>
  );
}

// Centered, stays open until closed — never navigates, never swaps photos on its own.
function PhotoViewer({ state, onClose }) {
  if (!state) return null;
  const { label, url, error } = state;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <p className="truncate text-sm font-extrabold">{label}</p>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-page">
            <X size={16} />
          </button>
        </div>
        <div className="grid min-h-[16rem] place-items-center bg-black">
          {error ? (
            <p className="px-6 py-10 text-center text-sm font-medium text-red-300">{error}</p>
          ) : url ? (
            <img src={url} alt={label} className="max-h-[70vh] w-full object-contain" />
          ) : (
            <Loader2 size={28} className="animate-spin text-white/60" />
          )}
        </div>
      </div>
    </div>
  );
}

function MonthCalendar({ month, records, joining }) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // week starts Monday
  const byDate = Object.fromEntries(records.map((r) => [r.date, r]));
  const today = ymd(new Date());
  const joinStr = joining ? ymd(new Date(joining)) : null;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(<div key={`b${i}`} />);
  for (let day = 1; day <= daysInMonth; day++) {
    const ds = `${month}-${pad(day)}`;
    const dow = new Date(y, m - 1, day).getDay();
    const rec = byDate[ds];
    let cls = 'text-black/25';
    let title = '';
    if (rec) {
      const key = rec.status === 'present' && rec.late ? 'late' : rec.status;
      cls = BADGE[key][1];
      title = `${BADGE[key][0]} · ${fmtTime(rec.checkIn)} – ${fmtTime(rec.checkOut)}`;
    } else if (dow === 0 || dow === 6) {
      cls = 'bg-black/5 text-black/30';
      title = 'Weekend';
    } else if (ds < today && (!joinStr || ds >= joinStr)) {
      cls = BADGE.absent[1];
      title = 'Absent';
    }
    cells.push(
      <div
        key={ds}
        title={title}
        className={`grid aspect-square place-items-center rounded-xl text-sm font-bold ${cls} ${
          ds === today ? 'ring-2 ring-role' : ''
        }`}
      >
        {day}
      </div>
    );
  }

  return (
    <Card title="Monthly calendar" subtitle={monthLabel(month)}>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase text-black/40">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="pb-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">{cells}</div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-black/55">
        {['present', 'late', 'half-day', 'absent'].map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ${BADGE[k][1].split(' ')[0]} border border-black/10`} />
            {BADGE[k][0]}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function Attendance() {
  const { user, employee } = useAuth();
  const role = user.role;
  const isAdmin = role === 'admin';
  const canPickPeople = role === 'admin' || role === 'manager';
  const myId = role === 'admin' ? undefined : employee?._id;

  const [month, setMonth] = useState(monthOf(new Date()));
  const [view, setView] = useState(role === 'admin' ? 'all' : role === 'manager' ? 'team' : 'me');
  const [people, setPeople] = useState([]);
  const [result, setResult] = useState({ data: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [photo, setPhoto] = useState(null); // { label, url, error } | null

  const single = view !== 'all' && view !== 'team';
  const employeeParam = view === 'me' ? myId : single ? view : undefined;
  const currentMonth = monthOf(new Date());

  useEffect(() => {
    if (!canPickPeople) return;
    api
      .get('/employees', { params: { status: 'active', limit: 100, sort: 'name' } })
      .then(({ data }) =>
        setPeople((data.data || []).filter((p) => p._id !== employee?._id && p.user?.role !== 'admin'))
      )
      .catch(() => {});
  }, [canPickPeople, employee?._id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/attendance', { params: { month, employee: employeeParam } })
      .then(({ data }) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(err.response?.data?.message || 'Could not load attendance'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month, employeeParam, reload]);

  const joining = useMemo(() => {
    if (view === 'me') return employee?.joiningDate;
    return people.find((p) => p._id === view)?.joiningDate;
  }, [view, employee, people]);

  const s = result.summary || {};
  const records = result.data || [];

  const subtitle =
    role === 'admin'
      ? 'Review monthly attendance for everyone in the organization.'
      : role === 'manager'
      ? 'Your own attendance and your team’s records.'
      : 'Check in and out, and review your monthly attendance.';

  const control = 'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold outline-none ring-role focus:ring-2';

  // Opens the viewer immediately with a spinner, then fills it in — the modal
  // itself never moves or swaps photos once an image has loaded.
  const openPhoto = async (record, which) => {
    const label = `${which === 'out' ? 'Check-out' : 'Check-in'} photo · ${record.employee?.name || 'You'} · ${shortDay(
      record.date
    )}`;
    setPhoto({ label, url: null, error: '' });
    try {
      const { data } = await api.get(`/attendance/${record._id}/photo`, { params: { which } });
      setPhoto({ label, url: data.url, error: '' });
    } catch (err) {
      setPhoto({ label, url: null, error: err.response?.data?.message || 'Could not load this photo' });
    }
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Attendance"
        subtitle={subtitle}
        workspace={`${role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Employee'} Workspace`}
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-white p-1">
          <button
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-36 text-center text-sm font-bold">{monthLabel(month)}</span>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={month >= currentMonth}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {canPickPeople && (
          <select value={view} onChange={(e) => setView(e.target.value)} className={control}>
            {role === 'admin' ? <option value="all">Everyone</option> : <option value="team">Whole team</option>}
            {myId && <option value="me">My attendance</option>}
            <optgroup label="Employees">
              {people.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.employeeCode})
                </option>
              ))}
            </optgroup>
          </select>
        )}
      </div>

      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      {/* Summary */}
      {single ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Working days" value={s.workingDays} hint="Mon–Fri this month" icon={CalendarDays} tone="blue" />
          <StatCard label="Present" value={s.present} hint={`${s.halfDay ?? 0} half-day`} icon={CheckCircle2} tone="green" />
          <StatCard label="Absent" value={s.absent} hint="Past days with no record" icon={XCircle} tone="orange" />
          <StatCard label="Late arrivals" value={s.late} icon={AlarmClock} tone="purple" />
          <StatCard label="Total hours" value={hrs(s.totalHours)} icon={Timer} tone="blue" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Records" value={s.records} icon={Clock} tone="blue" />
          <StatCard label="Present" value={s.present} icon={CheckCircle2} tone="green" />
          <StatCard label="Half-day" value={s.halfDay} icon={Timer} tone="orange" />
          <StatCard label="Late arrivals" value={s.late} icon={AlarmClock} tone="purple" />
        </div>
      )}

      {/* Check-in card + calendar / table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {(myId || single) && (
          <div className="space-y-6">
            {myId && <CheckInCard onChange={() => setReload((n) => n + 1)} />}
            {single && <MonthCalendar month={month} records={records} joining={joining} />}
          </div>
        )}

        <Card
          title="Attendance records"
          subtitle={
            single || role === 'employee'
              ? monthLabel(month)
              : `${monthLabel(month)} · ${role === 'admin' ? 'all employees' : 'your team'}`
          }
          className={myId || single ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          {loading ? (
            <Empty>Loading attendance…</Empty>
          ) : records.length === 0 ? (
            <Empty>No attendance records for this month.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-[11px] font-bold uppercase tracking-wide text-black/40">
                    <th className="py-3 pr-4">Date</th>
                    {!single && <th className="py-3 pr-4">Employee</th>}
                    <th className="py-3 pr-4">Check in</th>
                    <th className="py-3 pr-4">Check out</th>
                    <th className="py-3 pr-4">Hours</th>
                    <th className="py-3 pr-4">Late by</th>
                    <th className="py-3 pr-4">Early out</th>
                    <th className="py-3 pr-4">Overtime</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id} className="border-b border-black/5 last:border-0 hover:bg-page/60">
                      <td className="py-3.5 pr-4 font-semibold text-black/70">{shortDay(r.date)}</td>
                      {!single && (
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={r.employee?.name || '?'} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-bold">{r.employee?.name || '—'}</p>
                              <p className="text-xs text-black/45">{r.employee?.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 pr-4 font-semibold">
                        {fmtTime(r.checkIn)}
                        {isAdmin && r.hasCheckInPhoto && (
                          <PhotoIcon title="View check-in photo" onClick={() => openPhoto(r, 'in')} />
                        )}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold">
                        {fmtTime(r.checkOut)}
                        {isAdmin && r.hasCheckOutPhoto && (
                          <PhotoIcon title="View check-out photo" onClick={() => openPhoto(r, 'out')} />
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-black/70">{hrs(r.hours)}</td>
                      <td className="py-3.5 pr-4 text-blue-600">{mn(r.lateMinutes)}</td>
                      <td className="py-3.5 pr-4 text-orange-600">{mn(r.earlyLeaveMinutes)}</td>
                      <td className="py-3.5 pr-4 text-emerald-700">{mn(r.overtimeMinutes)}</td>
                      <td className="py-3.5">
                        <Badge record={r} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <PhotoViewer state={photo} onClose={() => setPhoto(null)} />
    </main>
  );
}