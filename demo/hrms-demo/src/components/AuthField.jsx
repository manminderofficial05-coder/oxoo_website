import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const base =
  'h-12 w-full rounded-xl border bg-white pl-11 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-black/35 focus:ring-4';
const okState = 'border-black/15 hover:border-black/30 focus:border-brand focus:ring-brand/15';
const badState = 'border-red-400 focus:border-red-500 focus:ring-red-500/15';

// Labelled input with a left icon for the auth pages. type="password" gets a show/hide eye.
// `labelRight` is an optional element on the label row (e.g. a "Forgot password?" link).
export default function AuthField({ id, label, icon: Icon, type = 'text', error, labelRight, ...inputProps }) {
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {labelRight}
      </div>

      <div className="relative">
        {Icon && (
          <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
        )}
        <input
          id={id}
          type={isPassword && shown ? 'text' : type}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${base} ${error ? badState : okState} ${isPassword ? 'pr-12' : 'pr-4'}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-black/40 hover:bg-surface hover:text-ink"
          >
            {shown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}