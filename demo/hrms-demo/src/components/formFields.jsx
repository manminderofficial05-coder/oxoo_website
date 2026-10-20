import { ChevronDown } from 'lucide-react';
import { inputClass, labelClass } from '../utils/form';

// Defined at module level on purpose: components defined inside another component
// remount on every keystroke and the input loses focus.

export function Section({ icon: Icon, title, children }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black/55">
        <Icon size={15} className="text-role" />
        {title}
        <span className="h-px flex-1 bg-black/5" />
      </h3>
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Field({ id, label, required, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        )}
        {hint && (
          <span className="ml-1.5 text-[11px] font-medium normal-case tracking-normal text-black/40">{hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ id, error, className = '', ...props }) {
  return (
    <input
      id={id}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${inputClass(!!error)} px-3.5 ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ id, error, children, ...props }) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-invalid={!!error || undefined}
        className={`${inputClass(!!error)} appearance-none pl-3.5 pr-10`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black/45" />
    </div>
  );
}