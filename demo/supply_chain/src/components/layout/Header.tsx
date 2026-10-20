import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Warehouse as WarehouseIcon,
  UserCheck,
  Menu,
  Shield,
  Layers,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useWarehouse } from '../../context/WarehouseContext.js';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onToggleSidebar,
}) => {
  const { user, switchRole, logout } = useAuth();
  const { warehouses, selectedWarehouseId, setSelectedWarehouseId } = useWarehouse();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const demoRoles = [
    { label: 'System Admin', value: 'SYSTEM_ADMIN' },
    { label: 'Warehouse Manager', value: 'WAREHOUSE_MANAGER' },
    { label: 'Warehouse Operator', value: 'WAREHOUSE_OPERATOR' },
    { label: 'Procurement Manager', value: 'PROCUREMENT_MANAGER' },
    { label: 'Quality Inspector', value: 'QUALITY_INSPECTOR' },
    { label: 'Manufacturing Manager', value: 'MANUFACTURING_MANAGER' },
    { label: 'Maintenance Tech', value: 'MAINTENANCE_TECHNICIAN' },
    { label: 'Read-Only Auditor', value: 'READ_ONLY_AUDITOR' },
    { label: 'Supplier (TechnoCore)', value: 'SUPPLIER' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-brand-card border-b border-brand-border shadow-xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-brand-muted hover:text-brand-text rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full h-10 px-3 text-sm text-brand-muted bg-white border border-brand-border rounded-lg shadow-xs hover:border-brand-active hover:text-brand-text transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-muted" />
            <span className="hidden sm:inline">Search products, POs, barcodes, lots...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Warehouse Selector, Demo Role Switcher, Alerts, Profile */}
      <div className="flex items-center gap-3">
        {/* Warehouse Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-bg rounded-lg border border-brand-border text-xs font-medium text-brand-text">
          <WarehouseIcon className="w-4 h-4 text-brand-active shrink-0" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-brand-text focus:outline-none cursor-pointer pr-1"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-active/10 hover:bg-brand-active/15 border border-brand-active/20 rounded-lg text-xs font-semibold text-brand-active transition-colors"
            title="Switch demo persona for testing role-based permissions"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{user?.role?.replace('_', ' ') || 'Role Switch'}</span>
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-border rounded-xl shadow-lg p-1.5 z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-muted border-b border-brand-border/60">
                Switch Role Persona
              </div>
              <div className="mt-1 space-y-0.5">
                {demoRoles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      switchRole(r.value);
                      setShowRoleDropdown(false);
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      user?.role === r.value
                        ? 'bg-brand-active text-white font-medium'
                        : 'text-brand-text hover:bg-brand-bg'
                    }`}
                  >
                    <span>{r.label}</span>
                    {user?.role === r.value && <Shield className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-bg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-error animate-pulse" />
        </button>

        {/* User Avatar & Name linking to Login / Switch Portal */}
        <Link
          to="/login"
          title="Switch Account or Login"
          className="flex items-center gap-2 pl-2 border-l border-brand-border hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {user ? user.firstName.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-brand-text leading-tight flex items-center gap-1.5">
              <span>{user ? `${user.firstName} ${user.lastName}` : 'Admin'}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                user?.role === 'SYSTEM_ADMIN'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'SYSTEM_ADMIN' ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="text-[10px] text-brand-muted leading-tight">
              {user?.department || 'Operations'}
            </div>
          </div>
        </Link>

        {/* Quick Sign Out Button */}
        <button
          onClick={logout}
          title="Sign Out to Login Page"
          className="p-1.5 text-brand-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
