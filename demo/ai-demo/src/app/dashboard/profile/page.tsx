'use client';

import { PageShell } from '@/components/dashboard/PageShell';
import { usePathname } from 'next/navigation';

// Demo build: the original page embeds a hosted auth-provider profile widget that
// needs production credentials. This read-only version shows the sample account.
const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 900 } as const;
const label = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', marginBottom: 4 } as const;
const value = { fontSize: 14, color: '#fff', marginBottom: 18 } as const;

export default function UserSettingsPage() {
  const isSecurity = usePathname().includes('/security');
  return (
    <PageShell
      title={isSecurity ? 'Security' : 'My Profile'}
      subtitle={isSecurity ? 'Manage your password, 2FA, and active sessions' : 'Manage your personal information and account details'}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={card}>
          {isSecurity ? (
            <>
              <div style={label}>Password</div><div style={value}>Disabled in the demo environment</div>
              <div style={label}>Two-factor authentication</div><div style={value}>Not available in the demo</div>
              <div style={label}>Active sessions</div><div style={value}>This browser (demo session)</div>
            </>
          ) : (
            <>
              <div style={label}>Name</div><div style={value}>Demo Admin</div>
              <div style={label}>Email</div><div style={value}>demo@hospitalcart.demo</div>
              <div style={label}>Role</div><div style={value}>Hospital administrator (sample)</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Profile editing is disabled in the demo.</p>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
