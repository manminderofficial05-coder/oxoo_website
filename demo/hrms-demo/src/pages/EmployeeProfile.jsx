import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  GraduationCap,
  Hash,
  Mail,
  Pencil,
  Phone,
  Shield,
  UserCheck,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/dash';
import { Modal, StatusBadge } from '../components/ui';
import FaceEnrollCard from '../components/FaceEnrollCard';
import SalaryCard from '../components/SalaryCard';
import HrDetailsCard from '../components/HrDetailsCard';
import DocumentsCard from '../components/DocumentsCard';
import ConvertInternForm from '../components/ConvertInternForm';
import InternBadge from '../components/InternBadge';
import { fmtDate, internEndText } from '../utils/format';

const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

// "1 month", "3 months", "2 yrs 4 mos", "12 days" — how long since the joining date
function tenure(value) {
  if (!value) return '';
  const start = new Date(value);
  const now = new Date();
  if (start > now) return 'Not started yet';
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 1) {
    const days = Math.max(Math.floor((now - start) / 86400000), 0);
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y === 1 ? '' : 's'}`);
  if (m) parts.push(`${m} mo${m === 1 ? '' : 's'}`);
  return parts.join(' ');
}

function Info({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-role/10 text-role">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-black/40">{label}</p>
        <div className="mt-0.5 break-words text-sm font-bold">{children || '—'}</div>
      </div>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-black/35">{title}</p>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Mini({ label, value, tone = '' }) {
  return (
    <div className="rounded-xl bg-page p-3.5 text-center">
      <p className={`text-2xl font-extrabold ${tone}`}>{value ?? '—'}</p>
      <p className="mt-0.5 text-xs font-medium text-black/45">{label}</p>
    </div>
  );
}

// Circular progress: remaining days out of the yearly limit. Turns amber, then red, as it runs low.
function Ring({ remaining, limit, size = 56 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = limit > 0 ? Math.min(Math.max(remaining / limit, 0), 1) : 0;
  const tone = pct <= 0.25 ? 'text-red-500' : pct <= 0.5 ? 'text-amber-500' : 'text-role';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-black/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={tone}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-extrabold">{remaining}</span>
    </div>
  );
}

function LeaveTile({ balance }) {
  const { leaveType, remaining, limit } = balance;
  const used = Math.max(limit - remaining, 0);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-page/60 p-3.5">
      <Ring remaining={remaining} limit={limit} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{leaveType.name}</p>
        <p className="mt-0.5 text-xs text-black/45">
          {used} of {limit} days used
        </p>
      </div>
    </div>
  );
}

function PhoneForm({ employee, onSaved, onCancel }) {
  const [phone, setPhone] = useState(employee.phone || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (phone && !PHONE_RE.test(phone)) return setError('Enter a valid phone number');
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/employees/${employee._id}`, { phone });
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}
      <label className="block text-xs font-bold uppercase tracking-wide text-black/60">
        Phone
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 w-full rounded-xl bg-page px-4 py-2.5 text-sm font-medium outline-none ring-role focus:ring-2"
        />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-full bg-page px-5 py-2.5 text-sm font-semibold hover:bg-black/10">
          Cancel
        </button>
        <button
          disabled={saving}
          className="rounded-full bg-role px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

const chip = 'inline-flex items-center gap-2 rounded-full bg-page px-3.5 py-1.5 text-xs font-semibold text-black/65';

export default function EmployeeProfile() {
  const { id } = useParams();
  const { user, employee: me } = useAuth();
  const [emp, setEmp] = useState(null);
  const [error, setError] = useState('');
  const [att, setAtt] = useState(null);
  const [balances, setBalances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    setEmp(null);
    setError('');
    api
      .get(`/employees/${id}`)
      .then(({ data }) => setEmp(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this profile'));

    api
      .get('/attendance', { params: { employee: id } })
      .then(({ data }) => setAtt(data.summary))
      .catch(() => setAtt(null));
    api
      .get('/leaves/balance', { params: { employee: id } })
      .then(({ data }) => setBalances(data.balances || []))
      .catch(() => setBalances([]));
  }, [id]);

  // Departments are only needed for the admin's "Convert to permanent" dialog
  useEffect(() => {
    if (user.role !== 'admin') return;
    api
      .get('/departments')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data || data?.departments || [];
        setDepartments(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, [user.role]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-role">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>
      </main>
    );
  }
  if (!emp) return <main className="p-8 text-sm text-black/40">Loading profile…</main>;

  const isSelf = me && me._id === emp._id;
  const role = emp.user?.role || 'employee';
  const isIntern = emp.employmentType === 'intern';
  const canEditPhone = isSelf || user.role === 'admin';
  const canRegisterFace = isSelf && user.role !== 'admin';
  const canConvert = user.role === 'admin' && isIntern && emp.status === 'active' && !isSelf;
  // Salary: admin only, and payroll is not run for admin accounts
  const canSeeSalary = user.role === 'admin' && role !== 'admin';
  const backTo = user.role === 'employee' ? '/' : '/employees';
  const deptOptions = departments.filter((d) => d.status === 'active' || d._id === emp.department?._id);
  const initial = emp.name.trim().charAt(0).toUpperCase();
  const since = tenure(emp.joiningDate);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black">
        <ArrowLeft size={16} /> {user.role === 'employee' ? 'Back to dashboard' : 'Back to employees'}
      </Link>

      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-role to-role/60">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute right-40 top-12 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/10" />
        </div>

        <div className="px-6 pb-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="-mt-12 flex items-end gap-5">
              <div className="rounded-full bg-white p-1.5 shadow-md">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-role/10 text-4xl font-extrabold text-role">
                  {initial}
                </div>
              </div>
              <div className="pb-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold leading-tight">{emp.name}</h1>
                  <InternBadge employee={emp} showEnd />
                </div>
                <p className="mt-0.5 text-sm text-black/55">
                  {emp.designation || 'No designation'} · {emp.employeeCode}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pb-1.5">
              <StatusBadge status={emp.status} />
              {canEditPhone && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-full bg-page px-4 py-2 text-sm font-bold hover:bg-black/10"
                >
                  <Pencil size={14} /> Edit phone
                </button>
              )}
              {canConvert && (
                <button
                  onClick={() => setConverting(true)}
                  className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                >
                  <BadgeCheck size={15} /> Convert to permanent
                </button>
              )}
              {user.role === 'admin' && (
                <Link to="/employees" className="rounded-full bg-role px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                  Manage
                </Link>
              )}
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 pt-4">
            {emp.department?.name && (
              <span className={chip}>
                <Building2 size={14} className="text-role" /> {emp.department.name}
              </span>
            )}
            {emp.manager && (
              <span className={chip}>
                <UserCheck size={14} className="text-role" /> Reports to {emp.manager.name}
              </span>
            )}
            <span className={chip}>
              <CalendarDays size={14} className="text-role" /> Joined {fmtDate(emp.joiningDate)}
              {since && <span className="text-black/40">· {since}</span>}
            </span>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Details">
            <div className="space-y-6">
              <Group title="Contact">
                <Info icon={Mail} label="Email">{emp.user?.email}</Info>
                <Info icon={Phone} label="Phone">{emp.phone}</Info>
              </Group>
              <div className="border-t border-black/5 pt-6">
                <Group title="Employment">
                  <Info icon={Building2} label="Department">{emp.department?.name}</Info>
                  <Info icon={Briefcase} label="Designation">{emp.designation}</Info>
                  <Info icon={Shield} label="Role"><span className="capitalize">{role}</span></Info>
                  <Info icon={Hash} label="Employee ID">{emp.employeeCode}</Info>
                  <Info icon={CalendarDays} label="Joining date">{fmtDate(emp.joiningDate)}</Info>
                  <Info icon={UserCheck} label="Reporting manager">
                    {emp.manager ? `${emp.manager.name} (${emp.manager.employeeCode})` : null}
                  </Info>
                  <Info icon={GraduationCap} label="Employment type">{isIntern ? 'Intern' : 'Permanent'}</Info>
                  {isIntern && (
                    <Info icon={CalendarDays} label="Internship ends">
                      {fmtDate(emp.internshipEndDate)}
                      {internEndText(emp.internshipEndDate) && (
                        <span className="ml-1.5 font-semibold text-black/45">({internEndText(emp.internshipEndDate)})</span>
                      )}
                    </Info>
                  )}
                  {!isIntern && emp.convertedOn && (
                    <Info icon={BadgeCheck} label="Converted to permanent">{fmtDate(emp.convertedOn)}</Info>
                  )}
                </Group>
              </div>
            </div>
          </Card>

          {balances.length > 0 && (
            <Card title="Leave balance" subtitle="This year">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {balances.map((b) => (
                  <LeaveTile key={b.leaveType._id} balance={b} />
                ))}
              </div>
            </Card>
          )}

          {canSeeSalary && <SalaryCard employeeId={emp._id} />}
        </div>

        <div className="space-y-6">
          {canRegisterFace && <FaceEnrollCard />}

          {att && (
            <Card title="This month" subtitle="Attendance">
              <div className="grid grid-cols-2 gap-3">
                <Mini label="Working days" value={att.workingDays} />
                <Mini label="Present" value={att.present} tone="text-emerald-600" />
                <Mini label="Absent" value={att.absent} tone="text-red-500" />
                <Mini label="Late" value={att.late} tone="text-amber-600" />
              </div>
              <Link to="/attendance" className="mt-4 inline-block text-xs font-bold text-role hover:underline">
                Open attendance →
              </Link>
            </Card>
          )}
        </div>
      </div>

      {(user.role === 'admin' || isSelf) && (
  <>
    <HrDetailsCard
      employee={emp}
      isAdmin={user.role === 'admin'}
      isSelf={isSelf}
      onUpdated={setEmp}
    />
    <DocumentsCard
      employee={emp}
      isAdmin={user.role === 'admin'}
      isSelf={isSelf}
      onUpdated={setEmp}
    />
  </>
)}

      {editing && (
        <Modal title="Edit phone" onClose={() => setEditing(false)}>
          <PhoneForm
            employee={emp}
            onCancel={() => setEditing(false)}
            onSaved={(data) => {
              setEmp(data);
              setEditing(false);
            }}
          />
        </Modal>
      )}

      {converting && (
        <Modal
          title="Convert to permanent"
          subtitle={`${emp.name} · ${emp.employeeCode}`}
          icon={BadgeCheck}
          size="lg"
          onClose={() => setConverting(false)}
        >
          <ConvertInternForm
            employee={emp}
            departments={deptOptions}
            onCancel={() => setConverting(false)}
            onSaved={(data) => {
              setEmp(data);
              setConverting(false);
            }}
          />
        </Modal>
      )}
    </main>
  );
}