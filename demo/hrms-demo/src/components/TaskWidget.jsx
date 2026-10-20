import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import { Card, Empty, ViewAll } from './dash';
import { useAuth } from '../context/AuthContext';

const dayLabel = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

export default function TaskWidget({ title = 'Tasks' }) {
  const { user } = useAuth();
  const taskAccess = user?.role === 'admin' || ['professional', 'enterprise'].includes(user?.subscription?.plan) || user?.subscription?.features?.teamTasks === true;

  const [s, setS] = useState(null);

  useEffect(() => {
    if (!taskAccess) {
      setS({ locked: true, open: 0, overdue: 0, done: 0, upcoming: [] });
      return undefined;
    }
    api
      .get('/tasks/summary')
      .then(({ data }) => setS(data))
      .catch(() => setS({ open: 0, overdue: 0, done: 0, upcoming: [] }));
  }, [taskAccess]);

  return (
    <Card
      title={title}
      subtitle="Open and overdue work"
      action={<ViewAll to="/tasks" />}
    >
      {!s ? (
        <Empty>Loading…</Empty>
      ) : s.locked ? (
        <div className="rounded-2xl bg-violet-50 p-5 text-center">
          <p className="font-bold text-violet-900">Team Tasks is a premium module</p>
          <p className="mt-1 text-sm text-violet-800/70">Unlock Professional to manage and track team work.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Open', s.open, 'text-blue-600 bg-blue-50'],
              ['Overdue', s.overdue, 'text-red-600 bg-red-50'],
              ['Done', s.done, 'text-emerald-700 bg-emerald-50'],
            ].map(([name, n, cls]) => (
              <div key={name} className={`rounded-2xl py-3 ${cls}`}>
                <p className="text-2xl font-extrabold">{n}</p>
                <p className="text-xs font-bold opacity-70">{name}</p>
              </div>
            ))}
          </div>

          {s.upcoming.length === 0 ? (
            <p className="pt-6 text-center text-sm text-black/40">
              No open tasks. All clear.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {s.upcoming.map((t) => (
                <li
                  key={t._id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{t.title}</p>

                    <p className="truncate text-xs text-black/45">
                      {user.role === 'employee'
                        ? `From ${t.assignedBy?.name || '—'}`
                        : `To ${t.assignedTo?.name || '—'}`}
                    </p>
                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      t.overdue
                        ? 'bg-red-50 text-red-600'
                        : 'bg-page text-black/55'
                    }`}
                  >
                    {t.overdue ? (
                      <AlertTriangle size={11} />
                    ) : (
                      <CalendarDays size={11} />
                    )}
                    {dayLabel(t.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}