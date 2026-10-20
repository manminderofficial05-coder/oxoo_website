import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { APP_NAME } from '../config/brand';

// Icon + wordmark. The icon is /public/logo-mark.png; the name is live text, so it stays sharp.
//  tone="dark"  -> white text, for dark backgrounds (sidebar, login hero)
//  tone="light" -> dark text, for white backgrounds (mobile login)
const SIZES = {
  sm: { mark: 'h-9 w-9', text: 'text-lg', icon: 18 },
  md: { mark: 'h-11 w-11', text: 'text-xl', icon: 22 },
  lg: { mark: 'h-14 w-14', text: 'text-3xl', icon: 28 },
};

const TONES = {
  dark: { text: 'text-white', accent: 'from-sky-400 to-emerald-400' },
  light: { text: 'text-ink', accent: 'from-sky-500 to-emerald-500' },
};

export default function Logo({ size = 'sm', tone = 'dark', to, className = '', full = false }) {
  const [failed, setFailed] = useState(false);
  const s = SIZES[size] || SIZES.sm;
  const t = TONES[tone] || TONES.dark;
  const classes = `flex items-center gap-2.5 ${t.text} ${className}`;

  const content = (
    full ? (
      <span className={`${size === 'lg' ? 'w-[270px]' : 'w-[190px]'} rounded-lg bg-white p-1.5`}>
        <img
          src="/Logo-full.png"
          alt={APP_NAME}
          draggable={false}
          className="h-auto w-full object-contain"
        />
      </span>
    ) : (
      <>
      {failed ? (
        <span className={`${s.mark} grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white`}>
          <Users size={s.icon} />
        </span>
      ) : (
        <img
          src="/logo-mark.png"
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
          className={`${s.mark} shrink-0 object-contain`}
        />
      )}
      <span className={`${s.text} font-extrabold tracking-tight`}>
        Employee
        <span className={`bg-gradient-to-r ${t.accent} bg-clip-text text-transparent`}>360°</span>
      </span>
      </>
    )
  );

  return to ? (
    <Link to={to} aria-label={`${APP_NAME} home`} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}