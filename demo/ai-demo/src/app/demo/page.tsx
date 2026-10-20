'use client';

import { useEffect } from 'react';
import { startDemoSession } from '@/demo/session';

/**
 * One-click demo entry for the company website: https://<demo-host>/demo
 * Starts a demo session in this browser and opens the product — no login screen.
 * (The regular /sign-in page with pre-filled demo credentials still works.)
 */
export default function DemoEntry() {
  useEffect(() => {
    startDemoSession();
    window.location.replace(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/dashboard/overview`);
  }, []);
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
      Opening demo…
    </main>
  );
}
