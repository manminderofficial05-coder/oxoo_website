import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { todayLabel } from '../utils/format';

export function Banner({ title, subtitle, workspace, action, tinted = true }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${
        tinted ? 'bg-gradient-to-br from-role/15 via-role/5 to-white p-7 ring-1 ring-role/10' : ''
      }`}
    >
      {tinted && (
        <>
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-role/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-role/10 blur-3xl" />
        </>
      )}
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-black/55">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="hidden text-right text-xs sm:block">
            <p className="flex items-center justify-end gap-1.5 font-semibold text-black/70">
              <CalendarDays size={14} /> {todayLabel()}
            </p>
            <p className="text-black/45">{workspace}</p>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section
      className={`rounded-3xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.10)] ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-black/45">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ViewAll({ to }) {
  return (
    <Link
      to={to}
      className="whitespace-nowrap rounded-full bg-role/10 px-3 py-1 text-xs font-bold text-role transition hover:bg-role/20"
    >
      View all →
    </Link>
  );
}

const TONES = {
  blue: 'from-blue-50 to-blue-100 text-blue-600',
  green: 'from-emerald-50 to-emerald-100 text-emerald-600',
  orange: 'from-orange-50 to-orange-100 text-orange-500',
  purple: 'from-violet-50 to-violet-100 text-violet-600',
};

export function StatCard({ label, value, hint, icon: Icon, tone = 'blue' }) {
  return (
    <div className="group flex items-center gap-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(16,24,40,0.22)]">
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br transition group-hover:scale-105 ${TONES[tone]}`}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-black/55">{label}</p>
        <p className="text-3xl font-extrabold leading-tight tracking-tight">{value ?? '—'}</p>
        {hint && <p className="truncate text-xs text-black/45">{hint}</p>}
      </div>
    </div>
  );
}

const PILLS = {
  pending: 'bg-orange-50 text-orange-600',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  present: 'bg-emerald-50 text-emerald-700',
  late: 'bg-blue-50 text-blue-600',
  absent: 'bg-red-50 text-red-600',
  not_in: 'bg-black/5 text-black/50',
};

export function Pill({ status, large = false }) {
  const label = status === 'not_in' ? 'Not in yet' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold ${
        large ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'
      } ${PILLS[status] || PILLS.not_in}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export function Empty({ children }) {
  return (
    <div className="grid place-items-center py-12">
      <div className="mb-3 h-10 w-10 rounded-2xl bg-black/[0.04]" />
      <p className="text-center text-sm font-medium text-black/40">{children}</p>
    </div>
  );
}

export function Skeleton({ className = 'h-24' }) {
  return <div className={`animate-pulse rounded-3xl bg-black/[0.05] ${className}`} />;
}

// Circular progress ring (uses the role colour)
export function Ring({ value, size = 112 }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 110 110" className="-rotate-90 text-role">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#eef0f3" strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: 'stroke-dashoffset .8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xl font-extrabold">{pct}%</div>
    </div>
  );
}