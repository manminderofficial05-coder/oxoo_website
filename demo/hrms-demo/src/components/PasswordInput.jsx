import { useState } from 'react';
import { Eye, EyeOff, Check, Circle, RefreshCw } from 'lucide-react';
import { inputClass, PASSWORD_RULES } from '../utils/form';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*';

const randomInt = (max) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
};
const pick = (chars) => chars[randomInt(chars.length)];

function generatePassword(length = 14) {
  const chars = [pick(DIGITS), pick(DIGITS), pick(SYMBOLS), pick(LETTERS), pick(LETTERS)];
  const all = LETTERS + DIGITS;
  while (chars.length < length) chars.push(pick(all));
  // Fisher-Yates shuffle so the guaranteed characters aren't always first
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// Live requirements checklist (shown once something has been typed)
export function PasswordRules({ value }) {
  if (!value) return null;
  return (
    <ul className="mt-2 space-y-1" aria-live="polite">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(value);
        return (
          <li
            key={r.label}
            className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-600' : 'text-black/45'}`}
          >
            {ok ? <Check size={13} strokeWidth={3} /> : <Circle size={11} />}
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Props:
 *  value, onChange(value: string)   <- receives the string, not the event
 *  id, name, placeholder, required, disabled
 *  error          boolean, draws the red error state
 *  showRules      live requirements checklist (default true)
 *  allowGenerate  "Generate" button (default false)
 *  autoComplete   default "new-password"
 */
export default function PasswordInput({
  value,
  onChange,
  id,
  name,
  placeholder = 'Enter a password',
  required = false,
  disabled = false,
  error = false,
  showRules = true,
  allowGenerate = false,
  autoComplete = 'new-password',
}) {
  const [visible, setVisible] = useState(false);

  const handleGenerate = () => {
    onChange(generatePassword());
    setVisible(true); // reveal it so the admin can read and share it
  };

  const iconBtn =
    'flex h-8 w-8 items-center justify-center rounded-lg text-black/45 hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-role';

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={200}
          aria-invalid={error || undefined}
          className={`${inputClass(error)} pl-3.5 ${allowGenerate ? 'pr-[5.25rem]' : 'pr-11'}`}
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
          {allowGenerate && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disabled}
              title="Generate a strong password"
              aria-label="Generate a strong password"
              className={`${iconBtn} hover:text-role`}
            >
              <RefreshCw size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            title={visible ? 'Hide password' : 'Show password'}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className={`${iconBtn} hover:text-ink`}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {showRules && <PasswordRules value={value} />}
    </div>
  );
}