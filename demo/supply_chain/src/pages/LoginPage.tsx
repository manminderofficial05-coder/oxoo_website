import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Boxes,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Warehouse,
  CheckCircle2,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Building2,
  ScanLine,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Mode: 'admin' | 'user'
  const [mode, setMode] = useState<'admin' | 'user'>('admin');
  const [email, setEmail] = useState('admin@flowstock.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Return to intended page or default
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSwitchMode = (newMode: 'admin' | 'user') => {
    setMode(newMode);
    setErrorMessage(null);
    if (newMode === 'admin') {
      setEmail('admin@flowstock.io');
      setPassword('admin123');
    } else {
      setEmail('user@flowstock.io');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password.trim());
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'admin' | 'user') => {
    setIsLoading(true);
    setErrorMessage(null);
    const targetEmail = targetRole === 'admin' ? 'admin@flowstock.io' : 'user@flowstock.io';
    const targetPassword = targetRole === 'admin' ? 'admin123' : 'user123';

    try {
      await login(targetEmail, targetPassword);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Mesh & Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-active/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-sage/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-teal text-white shadow-lg shadow-brand-teal/20 mb-4">
            <Boxes className="w-8 h-8 text-brand-sage" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            FlowStock <span className="text-brand-active">360</span>
          </h1>
          <p className="mt-1.5 text-sm text-brand-muted">
            Next-Generation Enterprise Supply Chain & Operations Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-brand-border/80 overflow-hidden">
          {/* Admin vs User Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-brand-border">
            <button
              type="button"
              onClick={() => handleSwitchMode('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                mode === 'admin'
                  ? 'bg-white text-brand-text shadow-sm border border-brand-border/60'
                  : 'text-slate-500 hover:text-brand-text'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${mode === 'admin' ? 'text-brand-active' : 'text-slate-400'}`} />
              <span>Admin Login</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold ml-1">
                Full
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('user')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                mode === 'user'
                  ? 'bg-white text-brand-text shadow-sm border border-brand-border/60'
                  : 'text-slate-500 hover:text-brand-text'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${mode === 'user' ? 'text-brand-active' : 'text-slate-400'}`} />
              <span>User Login</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold ml-1">
                Staff
              </span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Persona Capabilities Highlight Banner */}
            <div className={`p-3.5 rounded-xl border text-xs ${
              mode === 'admin'
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                : 'bg-blue-50/70 border-blue-200/80 text-blue-950'
            }`}>
              <div className="flex items-center gap-2 font-semibold mb-1">
                {mode === 'admin' ? (
                  <>
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Administrator Privileges Enabled</span>
                  </>
                ) : (
                  <>
                    <Warehouse className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Operations & Warehouse Staff Access</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {mode === 'admin'
                  ? 'Unrestricted access: Inventory Valuation, Audit Trail, BOMs, Purchase Approvals, System Administration, and 26 integrated ERP apps.'
                  : 'Staff access: Live Stock Operations, Barcode Scanner, Inbound Receipts, Outbound Deliveries, and Internal Transfers.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-text mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === 'admin' ? 'admin@flowstock.io' : 'user@flowstock.io'}
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-active focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-brand-text">
                    Password
                  </label>
                  <span className="text-[11px] text-brand-muted">
                    Demo: <span className="font-mono text-brand-active font-medium">{mode === 'admin' ? 'admin123' : 'user123'}</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-10 py-2 text-sm bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-active focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-active hover:bg-brand-active/90 active:scale-[0.99] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In as {mode === 'admin' ? 'Administrator' : 'Standard User'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Access Cards */}
            <div className="pt-4 border-t border-brand-border/70">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-brand-active" />
                <span>One-Click Instant Demo Login</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="flex flex-col items-start p-2.5 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/60 rounded-xl text-left transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Admin Demo</span>
                  </div>
                  <span className="text-[10px] text-emerald-700/80 mt-0.5">
                    Full Executive Access
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  disabled={isLoading}
                  className="flex flex-col items-start p-2.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200/60 rounded-xl text-left transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 group-hover:text-blue-700">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>User Demo</span>
                  </div>
                  <span className="text-[10px] text-blue-700/80 mt-0.5">
                    Warehouse & Ops
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Compliance Footnote */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-active" />
            ISO 9001 Compliant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-brand-active" />
            Multi-Warehouse Hub
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ScanLine className="w-3.5 h-3.5 text-brand-active" />
            RFID & Barcode Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
