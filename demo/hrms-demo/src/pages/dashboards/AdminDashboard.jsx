import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  Clock,
  FileText,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Banner, Card, Empty, Pill, StatCard, ViewAll } from '../../components/dash';
import { Avatar } from '../../components/ui';
import TaskWidget from '../../components/TaskWidget';
import { fmtShort, fmtTime, greeting, shortDay } from '../../utils/format';

const COLORS = ['#0c67ff', '#ef5907', '#16a34a', '#8b5cf6', '#06b6d4', '#eab308'];
const SERIES = [
  { key: 'present', name: 'Present', color: '#16a34a' },
  { key: 'late', name: 'Late', color: '#0c67ff' },
  { key: 'absent', name: 'Absent', color: '#f97316' },
];
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const th = 'px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-black/45';
const td = 'px-3 py-3.5';
const row = 'border-b border-black/5 transition-colors last:border-0 hover:bg-page/70';

const QUICK = [
  { to: '/employees?new=1', label: 'Add employee', hint: 'Create an account', icon: UserPlus },
  { to: '/leaves', label: 'Review leaves', hint: 'Approve or reject', icon: CalendarCheck },
  { to: '/tasks', label: 'Assign task', hint: 'Delegate work', icon: ClipboardList },
  { to: '/reports', label: 'View reports', hint: 'Export summaries', icon: FileText },
  { to: '/departments', label: 'Departments', hint: 'Manage teams', icon: Building2 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-black/5 bg-white/95 px-4 py-3 text-xs shadow-xl backdrop-blur">
      <p className="mb-1.5 font-extrabold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-semibold text-black/65">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="text-black">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex gap-4 text-xs font-semibold text-black/60">
      {SERIES.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /> {s.name}
        </span>
      ))}
    </div>
  );
}

function Person({ employee }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={employee?.name || '?'} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{employee?.name || 'Unknown'}</p>
        <p className="text-xs text-black/45">{employee?.employeeCode}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ data, firstName }) {
  const {
    stats = {},
    attendanceTrend = [],
    departmentDistribution = [],
    recentLeaves = [],
    todayAttendance = [],
  } = data || {};
  const deptTotal = departmentDistribution.reduce((s, d) => s + (d.count || 0), 0);
  const trend = attendanceTrend.map((d) => ({ ...d, label: shortDay(d.date) }));

  return (
<main className="w-full space-y-6 px-4 py-6 sm:px-8">      <Banner
        title={`${greeting()}, ${firstName} 👋`}
        subtitle="Here's what's happening across your organization today."
        workspace="Admin Workspace"
        action={
          <Link
            to="/employees?new=1"
            className="flex items-center gap-2 rounded-xl bg-role px-5 py-3 text-sm font-bold text-white shadow-lg shadow-role/30 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            <UserPlus size={16} /> Add Employee
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees}
          hint={`${stats.totalEmployees - stats.activeEmployees} inactive`}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Active Employees"
          value={stats.activeEmployees}
          hint={`${pct(stats.activeEmployees, stats.totalEmployees)}% of total`}
          icon={UserCheck}
          tone="green"
        />
        <StatCard
          label="Pending Leaves"
          value={stats.pendingLeaves}
          hint="awaiting review"
          icon={CalendarClock}
          tone="orange"
        />
        <StatCard
          label="Present Today"
          value={stats.presentToday}
          hint={`${pct(stats.presentToday, stats.activeEmployees)}% of active`}
          icon={Clock}
          tone="purple"
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {QUICK.map(({ to, label, hint, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-role/30 hover:shadow-lg"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-role/10 text-role transition group-hover:bg-role group-hover:text-white">
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold">{label}</span>
              <span className="block truncate text-xs text-black/45">{hint}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card
          className="lg:col-span-3"
          title="Attendance Overview"
          subtitle="Daily attendance for the last 7 days"
          action={<Legend />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {SERIES.map((s) => (
                    <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="#eef0f3" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#d6dae0', strokeDasharray: '4 4' }} />
                {SERIES.map((s) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2.5}
                    fill={`url(#fill-${s.key})`}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Department Distribution" subtitle="Active employees by team">
          {deptTotal === 0 ? (
            <Empty>No active employees yet.</Empty>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDistribution}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={82}
                      paddingAngle={3}
                      cornerRadius={6}
                      stroke="none"
                    >
                      {departmentDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight">{deptTotal}</p>
                    <p className="text-xs text-black/45">Employees</p>
                  </div>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-3 text-sm">
                {departmentDistribution.map((d, i) => (
                  <li key={d.name}>
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="min-w-0 flex-1 truncate font-semibold">{d.name}</span>
                      <span className="font-extrabold">{d.count}</span>
                      <span className="w-9 text-right text-xs text-black/45">{pct(d.count, deptTotal)}%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct(d.count, deptTotal)}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Recent Leave Requests" action={<ViewAll to="/leaves" />}>
          {recentLeaves.length === 0 ? (
            <Empty>No leave requests yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className={th}>Employee</th>
                    <th className={th}>Leave Type</th>
                    <th className={th}>Dates</th>
                    <th className={th}>Status</th>
                    <th className={th} />
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((l) => (
                    <tr key={l._id} className={row}>
                      <td className={td}><Person employee={l.employee} /></td>
                      <td className={td}>{l.leaveType?.name || '—'}</td>
                      <td className={td}>
                        <p className="font-semibold">{fmtShort(l.startDate)} – {fmtShort(l.endDate)}</p>
                        <p className="text-xs text-black/45">{l.days} {l.days === 1 ? 'day' : 'days'}</p>
                      </td>
                      <td className={td}><Pill status={l.status} /></td>
                      <td className={td}>
                        <Link
                          to="/leaves"
                          className="rounded-full bg-role/10 px-3.5 py-1.5 text-xs font-bold text-role transition hover:bg-role/20"
                        >
                          {l.status === 'pending' ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2" title="Today's Attendance" action={<ViewAll to="/attendance" />}>
          {todayAttendance.length === 0 ? (
            <Empty>No one has checked in yet today.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-sm">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className={th}>Employee</th>
                    <th className={th}>In</th>
                    <th className={th}>Out</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.map((a) => (
                    <tr key={a._id} className={row}>
                      <td className={td}><Person employee={a.employee} /></td>
                      <td className={td}>{fmtTime(a.checkIn)}</td>
                      <td className={td}>{fmtTime(a.checkOut)}</td>
                      <td className={td}><Pill status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <TaskWidget title="Organization tasks" />
    </main>
  );
}