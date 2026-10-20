import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  Receipt,
  ScanFace,
  ScrollText,
  Search,
  Settings,
  SlidersHorizontal,
  User,
  Users,
  Wallet,
  X,
  LockKeyhole,
  HandHelping,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui';
import Logo from './Logo';
import ErrorBoundary from './ErrorBoundary';

const NAV = {
  admin: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leaves', label: 'Leaves', icon: CalendarCheck },
    { to: '/team-tasks', label: 'Team Tasks', icon: ClipboardList, premium: true },
    { to: '/workhub', label: 'WorkHub', icon: Building2, premium: true },
    { to: '/need-a-hand', label: 'Need a Hand', icon: HandHelping, premium: true },
    { to: '/work-mode', label: 'Work Mode', icon: MapPin },
    { to: '/payroll', label: 'Payroll', icon: Wallet },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/holidays', label: 'Holidays', icon: CalendarDays },

    { section: 'Administration' },

    { to: '/designations', label: 'Designations', icon: BadgeCheck },
    { to: '/leave-types', label: 'Leave Types', icon: ListChecks },
    { to: '/offices', label: 'Offices', icon: MapPin },
    { to: '/face-approvals', label: 'Face Approvals', icon: ScanFace },
    { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/attendance-settings', label: 'Attendance Settings', icon: SlidersHorizontal },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],

  manager: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { profile: true, label: 'My Profile', icon: User },
    { to: '/employees', label: 'My Team', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/face-setup', label: 'Face ID', icon: ScanFace },
    { to: '/holidays', label: 'Holidays', icon: CalendarDays },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarCheck },
    { to: '/team-tasks', label: 'Team Tasks', icon: ClipboardList, premium: true },
    { to: '/work-mode', label: 'Work Mode', icon: MapPin },
    { to: '/workhub', label: 'WorkHub', icon: Building2, premium: true },
    { to: '/need-a-hand', label: 'Need a Hand', icon: HandHelping, premium: true },
    { to: '/my-payslips', label: 'My Payslips', icon: Receipt },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],

  employee: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { profile: true, label: 'My Profile', icon: User },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/face-setup', label: 'Face ID', icon: ScanFace },
    { to: '/holidays', label: 'Holidays', icon: CalendarDays },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarCheck },
    { to: '/team-tasks', label: 'Team Tasks', icon: ClipboardList, premium: true },
    { to: '/work-mode', label: 'Work Mode', icon: MapPin },
    { to: '/workhub', label: 'WorkHub', icon: Building2, premium: true },
    { to: '/need-a-hand', label: 'Need a Hand', icon: HandHelping, premium: true },
    { to: '/my-payslips', label: 'My Payslips', icon: Receipt },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
};

export default function Layout() {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [faceNudge, setFaceNudge] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const role = (user?.role || 'employee').toLowerCase();
  const displayName = employee?.name || user?.name || user?.email || 'User';
  const roleLabel = employee?.designation || user?.role || 'Employee';
  const canSearch = role === 'admin' || role === 'manager';
  const navList = NAV[role] || NAV.employee || [];
  const items = navList.map((i) =>
    i.profile ? { ...i, to: employee ? `/employees/${employee._id}` : '/' } : i
  );

  // First-login nudge: face check-in is on, but this person has no usable registration
  useEffect(() => {
    if (role === 'admin') return;
    Promise.all([api.get('/face/requirements'), api.get('/face/me')])
      .then(([req, me]) => setFaceNudge(!!req.data.requireFace && ['none', 'rejected'].includes(me.data.status)))
      .catch(() => setFaceNudge(false));
  }, [role, location.pathname]);

  // Ctrl+K focuses the search box
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close the user menu when clicking elsewhere
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/employees?search=${encodeURIComponent(q)}` : '/employees');
  };

  if (!user) return null;

  return (
    <div data-role={role} className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-side text-white transition-transform print:hidden lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Logo to="/" size="sm" full />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item, idx) =>
            item.section ? (
              <p
                key={item.section}
                className="px-3 pb-1 pt-5 text-[11px] font-bold uppercase tracking-widest text-white/40"
              >
                {item.section}
              </p>
            ) : (
              <NavLink
                key={`${item.label}-${idx}`}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-role text-white shadow-lg shadow-role/30'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.premium && (user?.subscription?.plan === 'demo' || role !== 'admin') && <LockKeyhole size={14} className="shrink-0 text-white/40" />}
              </NavLink>
            )
          )}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={displayName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs text-white/50">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/65 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md print:hidden sm:px-8">
          <button
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-page lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {canSearch ? (
            <form onSubmit={onSearch} className="relative max-w-xl flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees…"
                className="w-full rounded-xl bg-page py-2.5 pl-10 pr-16 text-sm font-medium outline-none ring-role focus:ring-2"
              />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-black/10 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-black/40 sm:block">
                Ctrl + K
              </kbd>
            </form>
          ) : (
            <div className="flex-1" />
          )}

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/leaves"
              title="Leave requests"
              className="grid h-10 w-10 place-items-center rounded-xl hover:bg-page"
            >
              <Bell size={20} />
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-page"
              >
                <Avatar name={displayName} />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold leading-tight">{displayName}</p>
                  <p className="text-xs capitalize leading-tight text-black/45">{roleLabel}</p>
                </div>
                <ChevronDown size={16} className="text-black/40" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-black/5 bg-white p-1.5 shadow-lg">
                  {employee && (
                    <Link
                      to={`/employees/${employee._id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-page"
                    >
                      <User size={16} /> My profile
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-accent hover:bg-page"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1800px] flex-1">
          {faceNudge && location.pathname !== '/face-setup' && (
            <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 print:hidden sm:mx-8">
              <span className="flex items-center gap-2">
                <ScanFace size={18} /> Face check-in is on. Register your face to be able to check in.
              </span>
              <Link to="/face-setup" className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:opacity-90">
                Set up now
              </Link>
            </div>
          )}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}