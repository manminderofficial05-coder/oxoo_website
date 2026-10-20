import { useMemo, useState } from 'react';
import { Download, FileText, Printer, Wallet } from 'lucide-react';
import { Banner, Card, StatCard } from '../components/dash';
import { INITIAL_PAYROLL } from '../data/payroll';
import { getDemoData } from '../utils/demoStorage';
import { fmtDate, fmtMoney, fmtMonth } from '../utils/format';

function Line({ label, detail, value, tone = '' }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <div>
        <p className="font-semibold">{label}</p>
        {detail && <p className="text-xs text-black/45">{detail}</p>}
      </div>
      <p className={`whitespace-nowrap font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function MyPayslips() {
  const allPayroll = getDemoData('payroll_records', INITIAL_PAYROLL);

  // Normalize demo records for my-payslips view
  const myPayslips = useMemo(() => {
    return allPayroll.map((p, idx) => ({
      _id: p._id || `slip-${idx}`,
      month: p.month || '2026-10',
      employeeName: p.employeeName || 'Sarah Williams',
      employeeCode: p.employeeId || 'EMP-001',
      department: p.department || 'Human Resources',
      designation: p.designation || 'HR Administrator',
      finalizedAt: p.payDate || '2026-10-31',
      monthlySalary: p.grossSalary || 85000,
      netPay: p.netSalary || 76500,
      totalDeductions: p.deductions || 8500,
      grossPay: p.grossSalary || 85000,
      overtimePay: 0,
      attendance: {
        workingDays: 22,
        presentDays: 21,
        halfDays: 0,
        paidLeaveDays: 1,
        absentDays: 0,
        unpaidLeaveDays: 0,
        lateCount: 1,
        overtimeMinutes: 120,
      },
      breakdown: p.breakdown || {
        basic: (p.grossSalary || 85000) * 0.6,
        hra: (p.grossSalary || 85000) * 0.24,
        specialAllowance: (p.grossSalary || 85000) * 0.16,
        pf: 5100,
        professionalTax: 200,
        incomeTax: 3200,
      },
    }));
  }, [allPayroll]);

  const [selectedId, setSelectedId] = useState(() => myPayslips[0]?._id);

  const selected = myPayslips.find((r) => r._id === selectedId) || myPayslips[0];
  const a = selected?.attendance || {
    workingDays: 22,
    presentDays: 21,
    halfDays: 0,
    paidLeaveDays: 1,
    absentDays: 0,
    unpaidLeaveDays: 0,
    lateCount: 0,
    overtimeMinutes: 0,
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <div className="print:hidden">
        <Banner
          title="My Payslips"
          subtitle="Your monthly salary statements and compensation breakdown."
          workspace="Employee Workspace"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Months List */}
        <div className="space-y-2 print:hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Available Statements
          </p>
          {myPayslips.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelectedId(r._id)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                r._id === selected?._id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 border border-black/5 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} className={r._id === selected?._id ? 'text-white' : 'text-slate-400'} />
                <span>{r.month}</span>
              </div>
              <span className={r._id === selected?._id ? 'text-white/90' : 'text-slate-500 font-semibold'}>
                {fmtMoney(r.netPay)}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Payslip Card */}
        {selected && (
          <Card
            title={`Salary Statement · ${selected.month}`}
            subtitle={`${selected.employeeName} · ${selected.employeeCode}`}
            action={
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition print:hidden"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            }
          >
            {/* Employee Meta Banner */}
            <div className="mb-6 grid gap-4 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-3">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Department</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900">{selected.department}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Designation</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900">{selected.designation}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-400">Disbursed On</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900">{fmtDate(selected.finalizedAt)}</p>
              </div>
            </div>

            {/* Earnings Section */}
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 mb-2">
              Earnings
            </h3>
            <div className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white px-4 py-2">
              <Line
                label="Basic Salary"
                detail="50% of annual compensation"
                value={fmtMoney(selected.breakdown.basic)}
              />
              <Line
                label="House Rent Allowance (HRA)"
                detail="Exempt under Section 10(13A)"
                value={fmtMoney(selected.breakdown.hra)}
              />
              <Line
                label="Special Allowance"
                detail="Performance & utility allowance"
                value={fmtMoney(selected.breakdown.specialAllowance)}
              />
            </div>

            {/* Deductions Section */}
            <h3 className="mt-6 text-xs font-extrabold uppercase tracking-wider text-red-800 mb-2">
              Deductions
            </h3>
            <div className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white px-4 py-2">
              <Line
                label="Employee Provident Fund (EPF)"
                detail="Statutory 12% contribution"
                value={`-${fmtMoney(selected.breakdown.pf)}`}
                tone="text-red-600"
              />
              <Line
                label="Professional Tax"
                detail="State government levy"
                value={`-${fmtMoney(selected.breakdown.professionalTax)}`}
                tone="text-red-600"
              />
              <Line
                label="Income Tax (TDS)"
                detail="Withheld under standard regime"
                value={`-${fmtMoney(selected.breakdown.incomeTax)}`}
                tone="text-red-600"
              />
            </div>

            {/* Net Payout Banner */}
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-sky-50 border border-sky-100 p-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Total Net Payable
                </span>
                <p className="text-xs text-sky-600">Disbursed directly to primary salary account</p>
              </div>
              <p className="text-3xl font-black text-sky-950">{fmtMoney(selected.netPay)}</p>
            </div>

            {/* Attendance Summary */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block mb-1">Attendance Record for {selected.month}:</span>
              {a.presentDays} days present · {a.paidLeaveDays} paid leave · {a.absentDays} absent · {a.lateCount} late arrival(s) out of {a.workingDays} working days.
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}