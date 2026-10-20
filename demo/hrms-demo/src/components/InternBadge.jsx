import { GraduationCap } from 'lucide-react';
import { daysUntil, internEndText } from '../utils/format';

// Renders nothing for permanent employees. Amber in the last 7 days, red once overdue.
export default function InternBadge({ employee, showEnd = false }) {
  if (employee?.employmentType !== 'intern') return null;

  const days = daysUntil(employee.internshipEndDate);
  const overdue = days != null && days < 0;
  const soon = days != null && days >= 0 && days <= 7;
  const tone = overdue ? 'bg-red-50 text-red-700' : soon ? 'bg-amber-100 text-amber-800' : 'bg-sky-50 text-sky-700';
  const text = internEndText(employee.internshipEndDate);

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>
        <GraduationCap size={12} />
        Intern
      </span>
      {showEnd && text && (
        <span className={`text-xs font-semibold ${overdue ? 'text-red-600' : 'text-black/45'}`}>{text}</span>
      )}
    </span>
  );
}