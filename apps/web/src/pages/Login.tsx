import { useState } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SocialSignIn from '../components/SocialSignIn';
import AuthLayout from '../components/auth/AuthLayout';
import AuthField from '../components/auth/AuthField';
import { authApi } from '../api/auth';
import { useAuth } from '../context/authState';
import type { ApiError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login(form);
      login(token);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.fields ? Object.values(apiError.fields).join('. ') : apiError.message ?? 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout mode="login">
      {error && <div className="auth-notice" role="alert">{error}</div>}
      <SocialSignIn disabled={loading} onBusy={setLoading} onError={setError} />
      <form className="auth-form" onSubmit={handleSubmit} aria-label="Sign in with email" aria-busy={loading}>
        <AuthField id="login-email" label="Email" type="email" autoComplete="email" placeholder="you@example.com"
          required disabled={loading} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <AuthField id="login-password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password"
          required disabled={loading} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowForwardRoundedIcon aria-hidden="true" />}
        </button>
      </form>
    </AuthLayout>
  );
}
