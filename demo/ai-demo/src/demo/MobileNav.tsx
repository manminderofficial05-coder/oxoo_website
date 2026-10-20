'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Responsive addition for the demo (the original layout has a fixed 220px sidebar and no
 * small-screen behaviour). On screens < 900px the sidebar becomes an off-canvas drawer opened
 * with a menu button. Desktop (>= 900px) is unchanged.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.body.toggleAttribute('data-nav-open', open); }, [open]);
  return (
    <>
      <style>{`
        .hc-menu-btn { display: none; }
        .hc-backdrop { display: none; }
        @media (max-width: 899px) {
          aside { transform: translateX(-100%); transition: transform .2s ease; }
          body[data-nav-open] aside { transform: translateX(0); box-shadow: 0 0 40px rgba(0,0,0,.6); }
          .hc-main { margin-left: 0 !important; min-width: 0; max-width: 100vw; }
          .hc-main header { padding: 0 12px !important; }
          .hc-main main { overflow-x: hidden; }
          .hc-menu-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; margin-right: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,.12); background: transparent; color: #fff; cursor: pointer; flex-shrink: 0; }
          body[data-nav-open] .hc-backdrop { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 35; }
          .hc-demo-hide-sm { display: none !important; }
          .hc-logo-mobile { display: inline-flex !important; align-items: center; }
          .hc-main main [style*="grid-template-columns"] { grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)) !important; }
          .hc-main main { min-width: 0; }
          .hc-main main > * { min-width: 0; max-width: 100%; }
          .hc-main main [style*="overflow"] { max-width: 100%; }
        }
        @media (max-width: 599px) {
          .hc-main header > div:first-child > span { display: none; }
          .hc-demo-hide-xs { display: none !important; }
        }
      `}</style>
      <button className="hc-menu-btn" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <div className="hc-backdrop" onClick={() => setOpen(false)} />
    </>
  );
}
