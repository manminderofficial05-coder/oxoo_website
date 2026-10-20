import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardList, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banner, Card, Empty, Pill, StatCard, ViewAll } from '../../components/dash';
import { Avatar } from '../../components/ui';
import TaskWidget from '../../components/TaskWidget';
import { fmtShort, greeting, shortDay } from '../../utils/format';

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export default function ManagerDashboard({ data, firstName }) {
  const { stats = {}, attendanceTrend = [], pendingRequests = [], members = [] } = data || {};
  const trend = attendanceTrend.map((d) => ({ ...d, label: shortDay(d.date) }));

  return (
<main className="w-full space-y-6 px-4 py-6 sm:px-8">      <Banner
        title={`${greeting()}, ${firstName} 👋`}
        subtitle="Here's your team's progress and updates for today."
        workspace="Team Workspace"
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/tasks"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ClipboardList size={16} /> Assign Task
            </Link>
            <Link
              to="/employees"
              className="rounded-xl bg-role px-5 py-3 text-sm font-bold text-white shadow-lg shadow-role/30 transition hover:-translate-y-0.5 hover:opacity-95"
            >
              View Team
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Team Size" value={stats.teamSize} hint="active members" icon={Users} tone="blue" />
        <StatCard
          label="Present Today"
          value={stats.presentToday}
          hint={`${pct(stats.presentToday, stats.teamSize)}% of team`}
          icon={UserCheck}
          tone="green"
        />
        <StatCard
          label="Pending Leaves"
          value={stats.pendingLeaves}
          hint="awaiting approval"
          icon={CalendarClock}
          tone="orange"
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          hint="last 7 days"
          icon={TrendingUp}
          tone="purple"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr_1fr]">
        <Card title="Team Attendance" subtitle="Last 7 days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip formatter={(v) => `${v}%`} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Attendance"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#rateFill)"
                  connectNulls
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Pending Leave Requests" action={<ViewAll to="/leaves" />}>
          {pendingRequests.length === 0 ? (
            <Empty>No pending requests.</Empty>
          ) : (
            <ul className="space-y-4">
              {pendingRequests.map((l) => (
                <li key={l._id} className="flex items-center gap-3">
                  <Avatar name={l.employee?.name || '?'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{l.employee?.name}</p>
                    <p className="truncate text-xs text-black/45">
                      {l.leaveType?.name} · {fmtShort(l.startDate)} – {fmtShort(l.endDate)} ({l.days}d)
                    </p>
                  </div>
                  <Pill status="pending" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Team Members" action={<ViewAll to="/employees" />}>
          {members.length === 0 ? (
            <Empty>No one reports to you yet.</Empty>
          ) : (
            <ul className="space-y-4">
              {members.map((m) => (
                <li key={m._id} className="flex items-center gap-3">
                  <Avatar name={m.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{m.name}</p>
                    <p className="truncate text-xs text-black/45">{m.designation || '—'}</p>
                  </div>
                  <Pill status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <TaskWidget title="Team tasks" />
    </main>
  );
}