'use client';
import { useState } from 'react';
import { resetDemo } from './api';

/** Discreet "Demo Environment" indicator + one-click reset of the sample data. */
export function DemoBadge() {
  const [confirming, setConfirming] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span title="This is a demo with fictional sample data. Nothing is sent to real patients." style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.25)', padding: '3px 8px', borderRadius: 999 }}>
        Demo Environment
      </span>
      <button
        className="hc-demo-hide-xs"
        onClick={() => {
          if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
            return;
          }
          resetDemo(true);
          try {
            localStorage.removeItem('hospital_dashboard_cache');
            localStorage.removeItem('hospital_dashboard_cache_overview');
            localStorage.removeItem('hospital_dashboard_cache_appointments');
            localStorage.removeItem('hospital_dashboard_cache_time');
            localStorage.removeItem('hospital_dashboard_cache_voice');
            localStorage.removeItem('hospital_dashboard_cache_crm');
            localStorage.removeItem('hospital_dashboard_cache_ai_chat');
          } catch {}
          window.location.reload();
        }}
        style={{ fontSize: 11, color: confirming ? '#fca5a5' : 'rgba(255,255,255,0.45)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}
      >
        {confirming ? 'Click again to reset to 0' : 'Reset demo data'}
      </button>
    </div>
  );
}
