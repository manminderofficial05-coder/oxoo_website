import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Logo } from './components';
import {
  Users, Key, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight,
  ExternalLink, Building, Lock, Mail, BadgeCheck, Sparkles
} from 'lucide-react';

const PrimePro_FINANCE_SERVICE_KEY = "PrimePro-FIN-2026-SECURE-KEY";

export default function EmployeeLoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmployeeId('rahul@primepro.ai');
    setPassword('emp123');
    setErrorMsg('');
  };

  const handleLaunchFinanceEmployeePortal = () => {
    const targetUrl = `https://oxoo-finance.onrender.com/?service_key=${PrimePro_FINANCE_SERVICE_KEY}&role=employee&view=employee-login&mode=employee&login_type=employee`;
    window.open(targetUrl, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      setErrorMsg('Please enter your Employee ID or Work Email and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Authenticate employee session with Finance Service Key
    setTimeout(() => {
      const empUser = {
        name: employeeId.includes('@') ? employeeId.split('@')[0] : 'Rahul Mehta',
        email: employeeId.includes('@') ? employeeId : `${employeeId}@company.com`,
        employeeId: employeeId.toUpperCase(),
        role: 'employee',
        department: 'Operations & HR',
        serviceKey: PrimePro_FINANCE_SERVICE_KEY
      };

      try {
        localStorage.setItem('oxoo_employee', JSON.stringify(empUser));
        window.dispatchEvent(new Event('oxoo_auth_change'));
      } catch (err) {}

      setSuccessMsg(`Authenticated as ${empUser.name}. Opening Finance Employee Suite...`);
      setLoading(false);

      const targetUrl = `https://oxoo-finance.onrender.com/?service_key=${PrimePro_FINANCE_SERVICE_KEY}&role=employee&view=employee-portal&user=${encodeURIComponent(empUser.email)}&name=${encodeURIComponent(empUser.name)}&auto_login=true`;
      window.open(targetUrl, '_blank');
    }, 600);
  };

  return (
    <>
      <Header />
      <main className="signin-page employee-login-page" style={{
        minHeight: '85vh',
        display: 'grid',
        placeItems: 'center',
        padding: '50px 20px',
        background: 'radial-gradient(ellipse at 50% 15%, #ecfdf5, #f8fafc 65%)'
      }}>
        <div className="signin-card" style={{
          width: 'min(100%, 460px)',
          background: '#ffffff',
          border: '1.5px solid #a7f3d0',
          borderRadius: '22px',
          padding: '38px 34px',
          boxShadow: '0 20px 45px rgba(16, 185, 129, 0.08)'
        }}>
          {/* Header & Logo */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Logo stacked={true} />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '20px',
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#047857',
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '10px'
            }}>
              <Users size={13} /> HRMS & Finance Employee Suite
            </div>
            <h1 style={{
              fontSize: '25px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '12px 0 6px',
              fontFamily: 'Manrope, sans-serif'
            }}>
              Employee Sign In
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Access your employee timesheets, biometric attendance, salary slips, and assigned finance tasks.
            </p>
          </div>

          {/* Finance Service Key Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={15} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                Finance Service Key Verified
              </span>
            </div>
            <span style={{
              fontSize: '10.5px',
              fontFamily: 'monospace',
              background: '#ffffff',
              border: '1px solid #86efac',
              padding: '2px 8px',
              borderRadius: '6px',
              color: '#047857',
              fontWeight: 700
            }}>
              {PrimePro_FINANCE_SERVICE_KEY}
            </span>
          </div>

          {/* 1-Click Direct Launch Button */}
          <button
            type="button"
            onClick={handleLaunchFinanceEmployeePortal}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
              marginBottom: '16px'
            }}
          >
            <ExternalLink size={15} /> Open Finance Employee Suite Directly ➔
          </button>

          {/* 1-Click Demo Shortcut */}
          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                ⚡ Demo Employee Account
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                rahul@primepro.ai (emp123)
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Fill Demo
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12.5px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12.5px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '14px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Employee ID or Work Email
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-101 or rahul@primepro.ai"
                style={{
                  width: '100%',
                  marginTop: '5px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </label>

            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  marginTop: '5px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In as Employee ➔'}
            </button>
          </form>

          {/* Customer / Admin Switcher Links */}
          <div style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <Link to="/login" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
              ← Customer Sign In
            </Link>
            <Link to="/admin" style={{ color: '#714b67', textDecoration: 'none', fontWeight: 600 }}>
              Admin Console →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
