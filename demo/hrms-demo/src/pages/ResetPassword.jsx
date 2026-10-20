import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import api from '../api/axios';
import AuthLayout from '../components/AuthLayout';
import AuthField from '../components/AuthField';
import { PasswordRules } from '../components/PasswordInput';
import { passwordProblem } from '../utils/form';

const TOKEN_RE = /^[a-f0-9]{64}$/i; // the server issues 64 hex characters

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token') || '');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Keep the one-time token out of the address bar and the browser history
  useEffect(() => {
    if (searchParams.has('token')) navigate('/reset-password', { replace: true });
  }, [navigate, searchParams]);

  if (!TOKEN_RE.test(token)) {
    return (
      <AuthLayout>
        <h2 className="text-3xl font-extrabold tracking-tight text-ink">This link can't be used</h2>
        <p className="mt-2 text-sm leading-relaxed text-black/55">
          The reset link is invalid or has expired. Reset links work once and expire after 15 minutes.
        </p>
        <Link
          to="/forgot-password"
          className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent to-orange-500 text-sm font-bold text-white shadow-lg shadow-accent/25"
        >
          Request a new link
        </Link>
        <div className="mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    const problem = passwordProblem(form.password);
    if (problem) found.password = problem;
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match';
    setErrors(found);
    setError('');
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      navigate('/login', {
        replace: true,
        state: { notice: 'Password updated. Sign in with your new password.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink">Set a new password</h2>
      <p className="mt-2 text-sm text-black/55">Choose a password you have not used for this account before.</p>

      <form onSubmit={submit} noValidate className="light-fields mt-8 space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}{' '}
            <Link to="/forgot-password" className="font-semibold underline">
              Request a new link
            </Link>
          </div>
        )}

        <div>
          <AuthField
            id="reset-password"
            label="New password"
            icon={Lock}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
            autoFocus
            maxLength={200}
            placeholder="Min. 10 characters"
          />
          <PasswordRules value={form.password} />
        </div>

        <AuthField
          id="reset-confirm"
          label="Confirm new password"
          icon={Lock}
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          error={errors.confirm}
          autoComplete="new-password"
          maxLength={200}
          placeholder="Re-enter the password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-orange-500 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:shadow-xl hover:shadow-accent/30 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Updating…
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>

      <div className="mt-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}