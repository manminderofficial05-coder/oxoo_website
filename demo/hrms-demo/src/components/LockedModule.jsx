import { useState } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COPY = {
  workhub: {
    title: 'WorkHub',
    description: 'Bring workplace operations, collaboration, announcements and employee coordination into one connected workspace.',
  },
  teamTasks: {
    title: 'Team Tasks',
    description: 'Plan, assign, and track team work with clear ownership, deadlines, sprint boards and progress tracking.',
  },
  needAHand: {
    title: 'Need a Hand',
    description: 'Give employees a simple way to ask for workplace help, request internal resources, and keep support tickets organized.',
  },
};

export default function LockedModule({ module }) {
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const copy = COPY[module] || COPY.workhub;

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_80px_rgba(30,41,59,0.10)]">
        <div className="bg-gradient-to-br from-sky-600 via-violet-600 to-indigo-700 px-8 py-12 text-white sm:px-12">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
            <LockKeyhole size={30} />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-white/60">Premium Module</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Feature Locked</h1>
          <p className="mt-2 text-sm text-white/80">{copy.title} is a premium enterprise feature.</p>
        </div>

        <div className="px-8 py-9 sm:px-12">
          <p className="max-w-xl text-base leading-7 text-black/60">{copy.description}</p>
          
          <div className="mt-7 rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-violet-600" />
              <p className="font-bold text-violet-900">This module is available in the Professional plan.</p>
            </div>
            <p className="mt-1 text-sm leading-6 text-violet-800/70">
              Unlock advanced team collaboration, automated workflows, and enterprise support features.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:shadow-xl hover:opacity-95"
            >
              Upgrade <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black/70 hover:bg-black/5"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Demo Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                <Sparkles size={24} />
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-full p-2 text-black/40 hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mt-4 text-xl font-extrabold text-ink">Upgrade Flow Coming Soon</h3>
            <p className="mt-2 text-sm text-black/60">
              Upgrade flow coming soon. In this standalone frontend demo, all core HR management modules (Employees, Attendance, Leaves, Payroll, Reports, Settings) are fully unlocked and populated with realistic demo data!
            </p>

            <div className="mt-5 space-y-2 text-xs font-semibold text-black/70">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={15} /> All core modules are active in this demo
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={15} /> No backend, server, or database needed
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
