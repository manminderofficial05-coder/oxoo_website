import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { Header, Footer, Logo } from './components';
import { resetPassword } from './api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Account email is required.');
      return;
    }

    if (!token) {
      setErrorMsg('Password reset token is missing from the link. Please request a new link from the login page.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email, token, newPassword });
      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/customer/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="signin-page reset-password-page" style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        padding: '50px 20px',
        background: 'radial-gradient(ellipse at 50% 15%, #e0f2fe, #f8fafc 65%)'
      }}>
        <div className="signin-card" style={{
          width: 'min(100%, 450px)',
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '22px',
          padding: '38px 34px',
          boxShadow: '0 18px 45px rgba(2, 132, 199, 0.08)'
        }}>
          {/* Header & Logo */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <Logo stacked={true} />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: '#f0f9ff',
              border: '1px solid #7dd3fc',
              color: '#0284c7',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '10px'
            }}>
              <KeyRound size={13} /> Account Security Recovery
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '12px 0 6px',
              fontFamily: 'Manrope, sans-serif'
            }}>
              Set New Password
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Create a new secure password for your OXOO customer account.
            </p>
          </div>

          {/* Account Indicator */}
          {emailParam && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '18px',
              fontSize: '12.5px',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Account:</span>
              <strong style={{ color: '#0369a1' }}>{emailParam}</strong>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              padding: '11px 14px',
              fontSize: '12.5px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div style={{
              padding: '12px 14px',
              fontSize: '13px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {!token && (
            <div style={{
              padding: '12px 14px',
              fontSize: '12.5px',
              borderRadius: '8px',
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              marginBottom: '18px'
            }}>
              Invalid or missing reset token. Please request a new password reset link from the login page.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!emailParam && (
              <label style={{ display: 'block', marginBottom: '14px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Account Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
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
            )}

            <label style={{ display: 'block', marginBottom: '14px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              New Password (min 6 characters)
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
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

            <label style={{ display: 'block', marginBottom: '22px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Confirm New Password
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
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

            <button
              type="submit"
              disabled={loading || !token}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: loading || !token ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Updating Password...' : 'Save New Password & Sign In →'}
            </button>
          </form>

          <div style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <Link
              to="/customer/login"
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0284c7',
                textDecoration: 'none'
              }}
            >
              ← Back to Customer Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
