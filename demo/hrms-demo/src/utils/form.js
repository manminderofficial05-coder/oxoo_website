// Shared form styling and password rules for the whole client.

export const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-black/60';

// Horizontal padding is left to the caller (px-3.5, or pr-* when icons sit inside the field).
export const inputClass = (hasError = false) =>
  [
    'h-11 w-full rounded-xl border bg-white text-sm font-medium text-ink outline-none',
    'placeholder:font-normal placeholder:text-black/35',
    'disabled:cursor-not-allowed disabled:bg-surface disabled:text-black/45',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
      : 'border-black/15 hover:border-black/30 focus:border-role focus:ring-4 focus:ring-role/15',
  ].join(' ');

// Mirrors server/utils/passwordPolicy.js for instant feedback only.
// The server stays the real authority and always re-validates.
export const PASSWORD_RULES = [
  { label: 'At least 10 characters', message: 'Password must be at least 10 characters', test: (p) => p.length >= 10 },
  { label: 'Contains a letter', message: 'Password must contain a letter', test: (p) => /[A-Za-z]/.test(p) },
  { label: 'Contains a number', message: 'Password must contain a number', test: (p) => /\d/.test(p) },
];

// Returns an error message, or '' when the password is acceptable.
export const passwordProblem = (p) => {
  const failed = PASSWORD_RULES.find((r) => !r.test(p || ''));
  return failed ? failed.message : '';
};