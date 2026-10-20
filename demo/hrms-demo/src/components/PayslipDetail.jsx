import { useEffect } from 'react';
import { AlertTriangle, Printer, X } from 'lucide-react';

// Money arrives in paise from the API
const inr = (paise = 0) =>
  (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const hm = (min = 0) => (min ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m` : '–');
const n = (v = 0) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const monthLabel = (m) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};
const dayLabel = (ds) =>
  new Date(`${ds}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' });

const STATUS = {
  present: ['Present', 'bg-emerald-50 text-emerald-700'],
  half_day: ['Half day', 'bg-amber-50 text-amber-700'],
  absent: ['Absent', 'bg-red-50 text-red-700'],
  paid_leave: ['Paid leave', 'bg-sky-50 text-sky-700'],
  unpaid_leave: ['Unpaid leave', 'bg-orange-50 text-orange-700'],
  not_joined: ['Not joined', 'bg-black/5 text-black/50'],
  upcoming: ['Not recorded yet', 'bg-black/5 text-black/50'],
};

function Stat({ label, value, tone = '' }) {
  return (
    <div className="rounded-2xl bg-page px-3 py-3 text-center">
      <p className="text-xs text-black/45">{label}</p>
      <p className={`mt-1 text-lg font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function Line({ label, hint, amount, sign, strong }) {
  const color = sign === '-' ? 'text-red-600' : sign === '+' ? 'text-emerald-700' : '';
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 ${strong ? 'border-t border-black/10 pt-3' : ''}`}>
      <div>
        <p className={`text-sm ${strong ? 'font-extrabold' : 'font-bold'}`}>{label}</p>
        {hint && <p className="mt-0.5 text-xs text-black/45">{hint}</p>}
      </div>
      <p className={`whitespace-nowrap text-sm font-extrabold ${strong ? 'text-lg' : ''} ${color}`}>
        {sign && sign !== '=' ? `${sign} ` : ''}
        {inr(amount)}
      </p>
    </div>
  );
}

/** Day-by-day table. Exported so the employee payslip page can reuse it. */
export function DayTable({ rows = [], admin = false, status }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-page p-4 text-sm text-black/55">
        The daily breakdown is not available for this payslip because it was calculated before daily
        details were added.
        {admin && status === 'draft' ? ' Run payroll again to generate it.' : ''}
      </p>
    );
  }

  const totalPayable = rows.reduce((s, d) => s + d.payableDays, 0);
  const totalEarned = rows.reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <div className="max-h-[26rem] overflow-auto rounded-2xl border border-black/10 print:max-h-none print:overflow-visible">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="sticky top-0 bg-page text-left text-xs font-bold text-black/50">
            <tr>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Worked</th>
              <th className="px-3 py-2.5">Overtime</th>
              <th className="px-3 py-2.5 text-right">Days paid</th>
              <th className="px-3 py-2.5 text-right">Earned</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const off = d.status === 'off';
              const [label, tone] = off
                ? [d.dayType === 'holiday' ? 'Holiday' : 'Weekly off', 'bg-black/5 text-black/45']
                : STATUS[d.status] || [d.status, 'bg-black/5'];
              return (
                <tr key={d.date} className={`border-t border-black/5 ${off ? 'text-black/40' : ''}`}>
                  <td className="whitespace-nowrap px-3 py-2">{dayLabel(d.date)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{label}</span>
                    {d.late && <span className="ml-1.5 text-xs font-bold text-amber-700">Late</span>}
                    {d.missedCheckout && <span className="ml-1.5 text-xs font-bold text-red-600">No check-out</span>}
                  </td>
                  <td className="px-3 py-2">{hm(d.workedMinutes)}</td>
                  <td className="px-3 py-2">
                    {d.overtimeMinutes ? `${hm(d.overtimeMinutes)} (${inr(d.overtimePay)})` : '–'}
                  </td>
                  <td className="px-3 py-2 text-right">{off ? '–' : n(d.payableDays)}</td>
                  <td className="px-3 py-2 text-right font-bold">{off ? '–' : inr(d.amount)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 bg-page font-extrabold">
            <tr>
              <td className="px-3 py-2.5" colSpan={4}>Total for working days</td>
              <td className="px-3 py-2.5 text-right">{n(totalPayable)}</td>
              <td className="px-3 py-2.5 text-right">{inr(totalEarned)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs text-black/45">
        Earned amounts cover working days only. Weekends and holidays are paid as part of the monthly
        salary. Late deductions and overtime are applied on top, as shown in the summary.
      </p>
    </>
  );
}

/**
 * Payslip for one employee-month.
 *  payroll  the Payroll document from the API (GET /payroll/:id or an item of /payroll/my)
 *  admin    true on the admin page: shows draft/finalized status and data warnings
 *  onClose  when given, renders as a side panel; otherwise renders inline (employee page)
 */
export default function PayslipDetail({ payroll, admin = false, onClose }) {
  useEffect(() => {
    if (!onClose) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!payroll) return null;

  const { attendance: a = {}, policy = {}, employee, flags = [], days: rows = [] } = payroll;
  const unpaid = (a.unpaidDays || 0) + (a.notJoinedDays || 0);
  const lateHalfDays = policy.latesPerHalfDay ? Math.floor((a.lateCount || 0) / policy.latesPerHalfDay) : 0;

  const body = (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">{employee?.name || 'Payslip'}</h2>
          <p className="text-sm text-black/50">
            {employee?.employeeCode}
            {employee?.department?.name ? `, ${employee.department.name}` : ''}
          </p>
          <p className="mt-1 text-sm font-bold">{monthLabel(payroll.month)}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {admin && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                payroll.status === 'finalized' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {payroll.status === 'finalized' ? 'Finalized' : 'Draft'}
            </span>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold hover:bg-page"
          >
            <Printer size={14} /> Print
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-page"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {admin && flags.includes('no_attendance') && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            No attendance or leave is recorded for this employee this month, so every working day counts as
            absent and the net pay is {inr(payroll.netPay)}. Check the Attendance page before finalizing.
          </p>
        </div>
      )}
      {admin && flags.includes('missed_checkouts') && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{a.missedCheckouts} day(s) have a check-in but no check-out. Worked hours and overtime for those days may be understated.</p>
        </div>
      )}

      <section>
        <h3 className="mb-1 text-sm font-extrabold">How the net pay is worked out</h3>
        <div className="divide-y divide-black/5 rounded-2xl border border-black/10 px-4">
          <Line
            label="Monthly salary"
            hint={`${a.workingDays} working days this month, so one day is worth ${inr(payroll.perDay)}`}
            amount={payroll.monthlySalary}
          />
          <Line
            label="Absent and unpaid days"
            hint={`${n(unpaid)} day(s) × ${inr(payroll.perDay)}. Counts absences, unpaid leave, half of each half-day${
              a.notJoinedDays ? `, and ${a.notJoinedDays} day(s) before joining` : ''
            }`}
            amount={payroll.absentDeduction}
            sign="-"
          />
          <Line
            label="Late arrivals"
            hint={`${a.lateCount || 0} late. Every ${policy.latesPerHalfDay} lates cost half a day, so ${lateHalfDays} half-day deduction(s)`}
            amount={payroll.lateDeduction}
            sign="-"
          />
          <Line
            label="Overtime"
            hint={
              policy.overtimeEnabled
                ? `${hm(a.overtimeMinutes)} at ${policy.overtimeMultiplier}× the hourly rate`
                : 'Overtime is not paid under the current policy'
            }
            amount={payroll.overtimePay}
            sign="+"
          />
          <Line label="Net pay" amount={payroll.netPay} sign="=" strong />
        </div>
        <p className="mt-2 text-xs text-black/45">
          Paid leave, weekends and holidays are not deducted. Unpaid leave is.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Working days" value={a.workingDays ?? 0} />
        <Stat label="Present" value={a.presentDays ?? 0} />
        <Stat label="Half days" value={a.halfDays ?? 0} />
        <Stat label="Absent" value={a.absentDays ?? 0} tone={a.absentDays ? 'text-red-600' : ''} />
        <Stat label="Paid leave" value={a.paidLeaveDays ?? 0} />
        <Stat label="Unpaid leave" value={a.unpaidLeaveDays ?? 0} />
        <Stat label="Late" value={a.lateCount ?? 0} />
        <Stat label="Before joining" value={a.notJoinedDays ?? 0} />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-extrabold">Day by day</h3>
        <DayTable rows={rows} admin={admin} status={payroll.status} />
      </section>
    </div>
  );

  if (!onClose) return body;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 print:static print:bg-transparent"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl print:max-w-none print:overflow-visible print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </div>
    </div>
  );
}