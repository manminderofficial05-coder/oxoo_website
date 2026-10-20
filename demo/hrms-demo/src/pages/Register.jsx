import { useState } from 'react';
import { ArrowRight, Building2, Loader2, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthField from '../components/AuthField';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', companyName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your demo account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-black/50">Start your Employee360 demo workspace.</p>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="light-fields mt-7 space-y-4">
        <AuthField id="register-name" label="Full name" icon={UserRound} name="name" value={form.name} onChange={handleChange} autoComplete="name" autoFocus placeholder="Your full name" />
        <AuthField id="register-company" label="Company name" icon={Building2} name="companyName" value={form.companyName} onChange={handleChange} autoComplete="organization" placeholder="Your company" />
        <AuthField id="register-email" label="Work email" icon={Mail} type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@company.com" />
        <AuthField id="register-phone" label="Phone" icon={Phone} name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" placeholder="Optional" />
        <AuthField id="register-password" label="Password" icon={Lock} type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" placeholder="At least 10 characters" />
        <AuthField id="register-confirm" label="Confirm password" icon={Lock} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" placeholder="Re-enter your password" />

        <button type="submit" disabled={submitting} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:shadow-xl disabled:opacity-70">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Creating account…</> : <>Create demo account <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/50">
        Already have an account? <Link to="/login" className="font-bold text-brand hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
