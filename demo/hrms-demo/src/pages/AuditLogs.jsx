import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Monitor,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_AUDIT_LOGS } from '../data/auditLogs';
import { getDemoData } from '../utils/demoStorage';

export default function AuditLogs() {
  const [logs] = useState(() =>
    getDemoData('audit_log_records', INITIAL_AUDIT_LOGS)
  );
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const modules = useMemo(() => {
    const set = new Set(logs.map((l) => l.module));
    return ['All', ...Array.from(set)];
  }, [logs]);

  const users = useMemo(() => {
    const set = new Set(logs.map((l) => l.user));
    return ['All', ...Array.from(set)];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q);
      const matchModule = moduleFilter === 'All' || log.module === moduleFilter;
      const matchUser = userFilter === 'All' || log.user === userFilter;
      const matchDate = !dateFilter || log.date === dateFilter;
      return matchSearch && matchModule && matchUser && matchDate;
    });
  }, [logs, search, moduleFilter, userFilter, dateFilter]);

  const handleExport = () => {
    const headers = ['User', 'User Role', 'Action', 'Details', 'Module', 'Date', 'Time', 'IP/Device', 'Status'];
    const rows = filtered.map((l) => [
      l.user,
      l.userRole,
      l.action,
      `"${l.details}"`,
      l.module,
      l.date,
      l.time,
      l.ipDevice,
      l.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit log records exported successfully');
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Banner
          title="Audit Logs"
          subtitle="Immutable security trail of administrative actions, profile updates and compliance events."
          workspace="Admin Workspace"
        />
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-800 transition"
        >
          <Download size={15} /> Export Audit Log
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Logged Events"
          value={logs.length}
          hint="Past 30 days active trail"
          icon={Activity}
          tone="blue"
        />
        <StatCard
          label="Authorized Admins"
          value={users.length - 1}
          hint="Generated audit records"
          icon={ShieldCheck}
          tone="green"
        />
        <StatCard
          label="Integrity Status"
          value="100% Verified"
          hint="Cryptographically signed"
          icon={Shield}
          tone="purple"
        />
      </div>

      {/* Audit Table Card */}
      <Card title="Activity Log Records" subtitle="Detailed timestamped records of security and operational changes.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter size={14} /> Module:
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All Users</option>
              {users
                .filter((u) => u !== 'All')
                .map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Module</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">IP / Device</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pr-4">
                    <span className="font-extrabold text-slate-900 block">{log.user}</span>
                    <span className="text-xs text-slate-500">{log.userRole}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="font-semibold text-slate-800 block">{log.action}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">{log.details}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-100">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs font-semibold text-slate-700">
                    {log.date}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs font-semibold text-slate-600">
                    {log.time}
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Monitor size={12} className="text-slate-400" />
                      {log.ipDevice}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No audit records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}