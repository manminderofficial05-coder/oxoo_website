import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Search,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_PAYROLL } from '../data/payroll';
import { getDemoData, setDemoData } from '../utils/demoStorage';

const fmtINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function Payroll() {
  const [payrollList, setPayrollList] = useState(() =>
    getDemoData('payroll_records', INITIAL_PAYROLL)
  );
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [activeSlip, setActiveSlip] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const departments = useMemo(() => {
    const set = new Set(payrollList.map((p) => p.department));
    return ['All', ...Array.from(set)];
  }, [payrollList]);

  const filtered = useMemo(() => {
    return payrollList.filter((item) => {
      const matchSearch =
        item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'All' || item.department === deptFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [payrollList, search, deptFilter, statusFilter]);

  // Statistics
  const totalPayroll = useMemo(
    () => payrollList.reduce((acc, curr) => acc + curr.netSalary, 0),
    [payrollList]
  );
  const paidCount = useMemo(
    () => payrollList.filter((p) => p.status === 'Paid').length,
    [payrollList]
  );
  const pendingCount = useMemo(
    () => payrollList.filter((p) => p.status === 'Pending').length,
    [payrollList]
  );

  const handleExportCsv = () => {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Designation',
      'Gross Salary (INR)',
      'Deductions (INR)',
      'Net Salary (INR)',
      'Status',
      'Month',
    ];
    const rows = filtered.map((p) => [
      p.employeeId,
      p.employeeName,
      p.department,
      p.designation,
      p.grossSalary,
      p.deductions,
      p.netSalary,
      p.status,
      p.month,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payroll_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Payroll CSV exported successfully');
  };

  const markAsPaid = (id) => {
    const updated = payrollList.map((p) => (p._id === id ? { ...p, status: 'Paid' } : p));
    setPayrollList(updated);
    setDemoData('payroll_records', updated);
    if (activeSlip && activeSlip._id === id) {
      setActiveSlip({ ...activeSlip, status: 'Paid' });
    }
    showToast('Salary payment marked as Paid');
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Banner
          title="Payroll"
          subtitle="Manage employee compensation, salary cycles and payroll records."
          workspace="Admin Workspace"
        />
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="October 2026">October 2026</option>
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
          </select>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-800"
          >
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Payroll"
          value={fmtINR(totalPayroll)}
          hint={`${payrollList.length} total staff`}
          icon={Wallet}
          tone="purple"
        />
        <StatCard
          label="Paid This Month"
          value={`${paidCount} of ${payrollList.length}`}
          hint="Disbursed successfully"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Pending"
          value={`${pendingCount}`}
          hint="Awaiting final clearance"
          icon={Clock}
          tone="orange"
        />
        <StatCard
          label="Employees"
          value={payrollList.length}
          hint="On active payroll"
          icon={Users}
          tone="blue"
        />
      </div>

      {/* Filters and Search Bar */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter size={14} /> Department:
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Employee</th>
                <th className="pb-3 pr-4">Employee ID</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4 text-right">Gross Salary</th>
                <th className="pb-3 pr-4 text-right">Deductions</th>
                <th className="pb-3 pr-4 text-right">Net Salary</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.employeeName}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{item.employeeName}</span>
                        <span className="text-xs text-slate-500">{item.designation}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs font-bold text-slate-600">
                    {item.employeeId}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {item.department}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right font-semibold text-slate-700">
                    {fmtINR(item.grossSalary)}
                  </td>
                  <td className="py-3.5 pr-4 text-right font-semibold text-red-600">
                    -{fmtINR(item.deductions)}
                  </td>
                  <td className="py-3.5 pr-4 text-right font-extrabold text-slate-900">
                    {fmtINR(item.netSalary)}
                  </td>
                  <td className="py-3.5 pr-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                        item.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setActiveSlip(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <Eye size={13} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    No payroll records matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details Modal */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-black/5 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payslip Preview · {activeSlip.month}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">{activeSlip.employeeName}</h2>
                <p className="text-xs text-slate-500">
                  {activeSlip.designation} · {activeSlip.department} · {activeSlip.employeeId}
                </p>
              </div>
              <button
                onClick={() => setActiveSlip(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Earnings & Deductions Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                    Earnings
                  </h3>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-bold text-slate-900">{fmtINR(activeSlip.breakdown.basic)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-bold text-slate-900">{fmtINR(activeSlip.breakdown.hra)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-bold text-slate-900">
                      {fmtINR(activeSlip.breakdown.specialAllowance)}
                    </span>
                  </div>
                  <div className="border-t border-black/5 pt-2 flex justify-between text-sm font-extrabold text-emerald-900">
                    <span>Gross Earnings</span>
                    <span>{fmtINR(activeSlip.grossSalary)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-800">
                    Deductions
                  </h3>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Provident Fund (PF)</span>
                    <span className="font-bold text-slate-900">{fmtINR(activeSlip.breakdown.pf)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-bold text-slate-900">
                      {fmtINR(activeSlip.breakdown.professionalTax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-bold text-slate-900">
                      {fmtINR(activeSlip.breakdown.incomeTax)}
                    </span>
                  </div>
                  <div className="border-t border-black/5 pt-2 flex justify-between text-sm font-extrabold text-red-700">
                    <span>Total Deductions</span>
                    <span>-{fmtINR(activeSlip.deductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="flex items-center justify-between rounded-2xl bg-sky-50 border border-sky-100 p-4">
                <div>
                  <span className="text-xs font-bold text-sky-800">Net Take-Home Pay</span>
                  <p className="text-xs text-sky-600">Disbursed via {activeSlip.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-sky-950">{fmtINR(activeSlip.netSalary)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Status:{' '}
                  <span className="font-bold text-slate-900">{activeSlip.status}</span>
                </span>
                <div className="flex gap-2">
                  {activeSlip.status !== 'Paid' && (
                    <button
                      onClick={() => markAsPaid(activeSlip._id)}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={() => {
                      showToast(`Downloaded payslip for ${activeSlip.employeeName}`);
                      setActiveSlip(null);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <Download size={13} /> Download Slip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}