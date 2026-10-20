import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  History,
  Boxes,
  Warehouse as WarehouseIcon,
  Factory,
  Wrench,
  GitBranch,
  ShieldCheck,
  ShieldAlert,
  ShoppingCart,
  ArrowUpFromLine,
  ArrowLeftRight,
  ScanBarcode,
  RotateCcw,
  RefreshCw,
  SearchCode,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Layers,
  FileText,
  FileCode,
  Users,
  Building2,
  Truck,
  Car,
  Globe,
  TrendingUp,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'Auditing & Traceability': false,
    Administration: true,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sections: NavSection[] = [
    {
      title: 'Command & Analytics',
      items: [
        { name: 'Command Center', path: '/command-center', icon: Radio },
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Supply Chain Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Demand Planning', path: '/demand-planning', icon: TrendingUp },
        { name: 'Activity Feed', path: '/activity-feed', icon: History },
      ],
    },
    {
      title: 'Operations 360',
      items: [
        { name: 'Inventory 360', path: '/inventory', icon: Boxes },
        { name: 'Warehouse 360', path: '/warehouse', icon: WarehouseIcon },
        { name: 'Stock Transfer', path: '/stock-transfers', icon: ArrowLeftRight },
        { name: 'Dispatch 360', path: '/dispatch', icon: ArrowUpFromLine },
        { name: 'Returns Management', path: '/returns', icon: RotateCcw },
        { name: 'Barcode & QR Scanner', path: '/barcode-scanner', icon: ScanBarcode },
      ],
    },
    {
      title: 'Procurement & Sourcing',
      items: [
        { name: 'Purchase 360', path: '/purchase', icon: ShoppingCart },
        { name: 'Procurement (PR)', path: '/procurement', icon: FileText },
        { name: 'RFQ Manager', path: '/rfq', icon: FileCode },
        { name: 'Vendor 360', path: '/vendors', icon: Users },
        { name: 'Vendor Portal', path: '/vendor-portal', icon: Building2 },
        { name: 'Replenishment', path: '/replenishment', icon: RefreshCw },
      ],
    },
    {
      title: 'Logistics & Fleet',
      items: [
        { name: 'Logistics 360', path: '/logistics', icon: Truck },
        { name: 'Fleet Management', path: '/fleet', icon: Car },
        { name: 'Import & Export', path: '/customs', icon: Globe },
      ],
    },
    {
      title: 'Manufacturing & Quality',
      items: [
        { name: 'Manufacturing', path: '/manufacturing', icon: Factory },
        { name: 'Quality Management', path: '/quality', icon: ShieldCheck },
        { name: 'Quality Receiving', path: '/quality-receiving', icon: ShieldAlert },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
        { name: 'Product Lifecycle (PLM)', path: '/plm', icon: GitBranch },
      ],
    },
    {
      title: 'Auditing & Traceability',
      items: [
        { name: 'Lot & Serial Tracking', path: '/lot-serial-tracking', icon: Layers },
        { name: 'Inventory Audit', path: '/inventory-audit', icon: ClipboardCheck },
        { name: 'Genealogy Trace', path: '/traceability', icon: SearchCode },
      ],
    },
    {
      title: 'Administration',
      items: [
        { name: 'Configuration & Settings', path: '/admin', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-brand-sidebar text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-active text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-white leading-tight">
                FlowStock 360
              </div>
              <div className="text-[11px] font-medium text-brand-sage/80 tracking-wide uppercase">
                Enterprise Suite
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((sec) => {
            const isCollapsed = !!collapsedSections[sec.title];
            return (
              <div key={sec.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(sec.title)}
                  className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  <span>{sec.title}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="mt-1 space-y-0.5">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.path === '/'
                          ? location.pathname === '/'
                          : location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => onClose && onClose()}
                          className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            isActive
                              ? 'bg-brand-active text-white shadow-sm font-semibold'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile / Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-black/10 shrink-0">
          <div className="flex items-center justify-between px-2 py-1.5">
            <NavLink
              to="/login"
              title="Click to Switch User / Admin Login"
              className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-brand-active flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {user ? user.firstName.charAt(0) : 'A'}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                  <span className="truncate">{user ? `${user.firstName} ${user.lastName}` : 'Administrator'}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    user?.role === 'SYSTEM_ADMIN'
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-blue-500/30 text-blue-300'
                  }`}>
                    {user?.role === 'SYSTEM_ADMIN' ? 'Admin' : 'User'}
                  </span>
                </div>
                <div className="text-[10px] text-brand-sage truncate">
                  {user?.role?.replace('_', ' ') || 'SYSTEM ADMIN'} • Switch
                </div>
              </div>
            </NavLink>
            <button
              onClick={logout}
              title="Sign Out to Login Page"
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
