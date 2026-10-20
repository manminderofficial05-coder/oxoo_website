import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, KeyRound, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthField from '../components/AuthField';

const NOTICE_STYLES = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Default credentials pre-filled for effortless 1-click evaluation
  const [form, setForm] = useState({
    email: 'demo@employee360.com',
    password: 'demo123',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [notice] = useState(() => {
    if (location.state?.notice) return { tone: 'ok', text: location.state.notice };
    if (sessionStorage.getItem('pp_expired')) {
      return { tone: 'warn', text: 'Your session has expired. Please sign in again.' };
    }
    return null;
  });

  useEffect(() => {
    sessionStorage.removeItem('pp_expired');
  }, []);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fillDemo = () => {
    setForm({ email: 'demo@employee360.com', password: 'demo123' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-ink">Welcome back</h2>
        <p className="mt-2 text-sm text-black/50">Sign in to your Employee360 demo workspace.</p>
      </div>

      {notice && (
        <div role="status" className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${NOTICE_STYLES[notice.tone]}`}>
          {notice.text}
        </div>
      )}

      {/* Demo helper card */}
      <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/80 p-3.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-sky-900">
            <KeyRound size={14} className="text-sky-600" /> Demo Credentials:
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 font-bold text-white transition hover:bg-sky-700"
          >
            <Sparkles size={12} /> Auto-fill
          </button>
        </div>
        <p className="mt-1 text-sky-800/80">
          Email: <span className="font-mono font-bold text-sky-950">demo@employee360.com</span> · Password: <span className="font-mono font-bold text-sky-950">demo123</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="light-fields mt-6 space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <AuthField
          id="login-id"
          label="Email or Employee ID"
          icon={Mail}
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="username"
          autoFocus
          placeholder="demo@employee360.com"
        />

        <AuthField
          id="login-password"
          label="Password"
          icon={Lock}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          placeholder="demo123"
          labelRight={
            <Link to="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
              Forgot password?
            </Link>
          }
        />

        <div className="flex items-center justify-between text-xs font-medium text-black/60 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-black/20 text-brand focus:ring-brand accent-sky-600"
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-orange-500 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:shadow-xl hover:shadow-accent/30 disabled:opacity-70 mt-2"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-black/50">
        New to Employee360?{' '}
        <Link to="/register" className="font-bold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}