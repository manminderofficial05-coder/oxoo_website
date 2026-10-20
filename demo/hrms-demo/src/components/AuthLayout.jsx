import { ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { APP_NAME } from '../config/brand';

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eff8ff] via-white to-[#e9fbf3] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo tone="light" size="lg" full />
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_80px_rgba(30,41,59,0.12)] sm:p-8">
          {children}
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-black/35">
          <ShieldCheck size={13} /> © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </main>
  );
}
