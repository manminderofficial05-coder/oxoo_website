export const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

// For <input type="date"> values
export const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const fmtShort = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

// 'YYYY-MM-DD' -> 'Oct 5'
export const shortDay = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const fmtTime = (value) =>
  value ? new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

export const fmtDuration = (mins) =>
  mins == null ? '—' : `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// Money is stored in paise. 3000000 -> '₹30,000.00'
export const fmtMoney = (paise) =>
  `₹${((paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Plain rupee string for CSV files: 3000000 -> '30000.00'
export const toRupees = (paise) => ((paise || 0) / 100).toFixed(2);

// 'YYYY-MM' -> 'September 2026'
export const fmtMonth = (m) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

// Local today as YYYY-MM-DD (toISOString would shift the day in some time zones)
export const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 'YYYY-MM-DD' -> a day number, so two dates can be subtracted without time-zone drift
const dayNumber = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

// Whole days from today until a date (negative = in the past); null when there is no date
export const daysUntil = (value) =>
  value ? Math.round(dayNumber(toInputDate(value)) - dayNumber(localToday())) : null;

// 'Ends in 12 days' / 'Ends tomorrow' / 'Ends today' / 'Ended 3 days ago'
export const internEndText = (value) => {
  const d = daysUntil(value);
  if (d == null) return '';
  if (d < 0) return `Ended ${-d} day${d === -1 ? '' : 's'} ago`;
  if (d === 0) return 'Ends today';
  if (d === 1) return 'Ends tomorrow';
  return `Ends in ${d} days`;
};