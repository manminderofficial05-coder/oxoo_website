import { Link } from 'react-router-dom';
import { CalendarCheck, CalendarClock, ClipboardList, Clock, WalletCards } from 'lucide-react';
import { Banner, Card, Empty, Pill, Ring, ViewAll } from '../../components/dash';
import CheckInButton from '../../components/CheckInButton';
import TaskWidget from '../../components/TaskWidget';
import { fmtDuration, fmtShort, fmtTime, greeting } from '../../utils/format';

const th = 'px-3 py-2.5 text-left text-xs font-bold text-black/50';
const td = 'px-3 py-3';

function Mini({ label, value }) {
  return (
    <div className="rounded-2xl bg-page py-3 text-center">
      <p className="text-xs text-black/45">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}

const action =
  'flex items-center gap-3 rounded-2xl border border-black/10 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-page hover:shadow-md';

export default function EmployeeDashboard({ data, firstName, onRefresh }) {
  const {
    today = { status: 'present', workingMinutes: 480 },
    leaveBalance = { remaining: 14, total: 18 },
    month = { workingDays: 22, presentDays: 21, absentDays: 0, lateCount: 1 },
    pendingCount = 0,
    recentLeaves = [],
    upcomingLeaves = [],
  } = data || {};

  return (
    <main className="w-full space-y-6 px-4 py-6 sm:px-8">
      <Banner
        title={`${greeting()}, ${firstName} ☀️`}
        subtitle="Have a great day! Here's your personal overview."
        workspace="Employee Workspace"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Today's Attendance">
          <Pill status={today.status} large />
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Mini label="Check in" value={fmtTime(today.checkIn)} />
            <Mini label="Check out" value={fmtTime(today.checkOut)} />
            <Mini label="Working" value={fmtDuration(today.workingMinutes)} />
          </div>
        </Card>

        <Card title="Leave Balance">
          <p className="text-3xl font-extrabold tracking-tight">
            {leaveBalance.remaining} <span className="text-lg font-bold text-black/40">days</span>
          </p>
          <p className="text-xs text-black/45">Annual leave remaining</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Mini label="Used" value={leaveBalance.used} />
            <Mini label="Remaining" value={leaveBalance.remaining} />
            <Mini label="Total" value={leaveBalance.total} />
          </div>
        </Card>

        <Card title="Attendance This Month">
          <div className="flex items-center gap-5">
            <Ring value={month.rate} />
            <div className="text-sm">
              <p className="text-xl font-extrabold">
                {month.presentDays} <span className="text-black/35">/ {month.workingDays}</span>
              </p>
              <p className="text-xs text-black/45">days present</p>
              <p className="mt-3 text-sm font-bold text-accent">{month.absentDays} absent</p>
              {month.leaveDays > 0 && (
                <p className="mt-1 text-xs text-black/45">{month.leaveDays} on approved leave</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Pending Requests">
          <p className="text-3xl font-extrabold tracking-tight">{pendingCount}</p>
          <p className="text-xs text-black/45">Leave {pendingCount === 1 ? 'request' : 'requests'}</p>
          <Link
            to="/leaves"
            className="mt-5 inline-block rounded-full bg-role/10 px-3 py-1 text-xs font-bold text-role transition hover:bg-role/20"
          >
            View details →
          </Link>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.6fr_1fr]">
        <Card title="Quick Actions">
          <div className="grid gap-3">
            <CheckInButton today={today} onDone={onRefresh} />

            <Link to="/leaves" className={action}>
              <CalendarCheck size={20} className="text-role" />
              <div>
                <p className="text-sm font-bold">Request Leave</p>
                <p className="text-xs text-black/45">Apply for leave</p>
              </div>
            </Link>

            <Link to="/tasks" className={action}>
              <ClipboardList size={20} className="text-role" />
              <div>
                <p className="text-sm font-bold">My Tasks</p>
                <p className="text-xs text-black/45">See what's assigned to you</p>
              </div>
            </Link>

            {/* Single payslips link. Confirm /my-payslips is the route registered in your router. */}
            <Link to="/my-payslips" className={action}>
              <WalletCards size={20} className="text-role" />
              <div>
                <p className="text-sm font-bold">My Payslips</p>
                <p className="text-xs text-black/45">View your salary slips</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Recent Leave Requests" action={<ViewAll to="/leaves" />}>
          {recentLeaves.length === 0 ? (
            <Empty>You haven't requested any leave yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-sm">
                <thead className="bg-page">
                  <tr>
                    <th className={`${th} rounded-l-xl`}>Type</th>
                    <th className={th}>Period</th>
                    <th className={`${th} rounded-r-xl`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((l) => (
                    <tr key={l._id} className="border-b border-black/5 last:border-0">
                      <td className={td}>{l.leaveType?.name || '—'}</td>
                      <td className={td}>
                        {fmtShort(l.startDate)} – {fmtShort(l.endDate)}
                      </td>
                      <td className={td}>
                        <Pill status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Upcoming Leave">
          {upcomingLeaves.length === 0 ? (
            <div className="py-6 text-center">
              <CalendarClock size={28} className="mx-auto text-black/25" />
              <p className="mt-3 text-sm font-bold">No upcoming leave</p>
              <p className="mt-1 text-xs text-black/45">Approved leave in the coming days will show here.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {upcomingLeaves.map((l) => (
                <li key={l._id} className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-role/10 text-role">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{l.leaveType?.name}</p>
                    <p className="text-xs text-black/45">
                      {fmtShort(l.startDate)} – {fmtShort(l.endDate)} · {l.days}d
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <TaskWidget title="My tasks" />
    </main>
  );
}