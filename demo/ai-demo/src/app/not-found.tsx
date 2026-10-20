import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>404 — Page Not Found</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>The requested page could not be found.</p>
      <Link href="/dashboard/overview" style={{ color: '#818cf8', textDecoration: 'none' }}>
        Return to Dashboard →
      </Link>
    </div>
  );
}
