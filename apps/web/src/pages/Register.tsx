import { useState } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SocialSignIn from '../components/SocialSignIn';
import AuthLayout from '../components/auth/AuthLayout';
import AuthField from '../components/auth/AuthField';
import { authApi } from '../api/auth';
import { useAuth } from '../context/authState';
import type { ApiError } from '../api/client';
import { Link } from 'react-router-dom';

export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || accountCreated) return;
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    let created = false;
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      created = true;
      setAccountCreated(true);
      const { token } = await authApi.login({ email: form.email, password: form.password });
      login(token);
    } catch (err) {
      const apiErr = err as ApiError;
      if (created) {
        setError('Your account was created. Please use Sign In to continue.');
      } else if (apiErr.fields) {
        setError(Object.values(apiErr.fields).join('. '));
      } else {
        setError(apiErr.message ?? 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout mode="register">
      {error && <div className={accountCreated ? 'auth-notice auth-notice-success' : 'auth-notice'} role="alert">
        {error} {accountCreated && <Link to="/login">Continue to sign in →</Link>}
      </div>}
      <SocialSignIn disabled={loading} onBusy={setLoading} onError={setError} />
      <form className="auth-form" onSubmit={handleSubmit} aria-label="Create an account with email" aria-busy={loading}>
        <AuthField id="register-name" label="Full Name" autoComplete="name" placeholder="Your full name"
          required disabled={loading || accountCreated} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <AuthField id="register-email" label="Email" type="email" autoComplete="email" placeholder="you@example.com"
          required disabled={loading || accountCreated} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <AuthField id="register-password" label="Password" type="password" autoComplete="new-password" placeholder="Create a password" hint="Use at least 8 characters." minLength={8}
          required disabled={loading || accountCreated} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        <AuthField id="register-confirm" label="Confirm Password" type="password" autoComplete="new-password" placeholder="Enter your password again"
          required disabled={loading || accountCreated} value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
        <button className="auth-submit" type="submit" disabled={loading || accountCreated}>
          {loading ? 'Creating your account…' : 'Create account'} {!loading && <ArrowForwardRoundedIcon aria-hidden="true" />}
        </button>
      </form>
    </AuthLayout>
  );
}
