'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hasDemoSession } from './session';

/** Client-side stand-in for the original session middleware: no demo session -> sign-in. */
export function DemoGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!hasDemoSession()) {
      window.location.replace(`/sign-in?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    } else setReady(true);
  }, [pathname]);
  if (!ready) return <div style={{ minHeight: '100vh', background: '#0a0a0f' }} />;
  return <>{children}</>;
}
