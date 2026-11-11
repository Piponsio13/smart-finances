import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { useAuth } from './authState';
import { authApi } from '../api/auth';
import ProtectedRoute from '../components/ProtectedRoute';

vi.mock('../api/auth', () => ({ authApi: { me: vi.fn() } }));

function token(exp = Math.floor(Date.now() / 1000) + 3600) {
  return `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ exp }))}.signature`;
}

function LoginPage() {
  const { login } = useAuth();
  return <button onClick={() => login(token())}>Sign in</button>;
}

function PrivatePage() {
  const { logout } = useAuth();
  const location = useLocation();
  return <><p>Private {location.pathname}{location.search}</p><button onClick={logout}>Sign out</button></>;
}

function mount(path = '/budgets?year=2026') {
  return render(<MemoryRouter initialEntries={[path]}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<ProtectedRoute><PrivatePage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(authApi.me).mockReset();
  vi.mocked(authApi.me).mockResolvedValue({ name: 'Alice', email: 'alice@example.com' });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('session lifecycle', () => {
  it.each(['invalid-token', token(1)])('rejects malformed or expired saved sessions', (saved) => {
    localStorage.setItem('sf_token', saved);
    mount();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDefined();
    expect(localStorage.getItem('sf_token')).toBeNull();
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it('does not show protected data until the server verifies a saved token', async () => {
    const saved = token();
    localStorage.setItem('sf_token', saved);
    let finish!: (user: { name: string; email: string }) => void;
    vi.mocked(authApi.me).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    mount();
    expect(screen.getByLabelText('Checking session')).toBeDefined();
    expect(screen.queryByText('Private /budgets?year=2026')).toBeNull();
    await act(async () => finish({ name: 'Alice', email: 'alice@example.com' }));
    expect(screen.getByText('Private /budgets?year=2026')).toBeDefined();
    expect(authApi.me).toHaveBeenCalledWith(saved, expect.any(AbortSignal));
  });

  it('offers retry on a temporary server failure without losing the token', async () => {
    const saved = token();
    localStorage.setItem('sf_token', saved);
    vi.mocked(authApi.me).mockRejectedValueOnce(new TypeError('Network unavailable'));
    mount();
    await screen.findByRole('button', { name: 'Try again' });
    expect(localStorage.getItem('sf_token')).toBe(saved);
    expect(screen.queryByText('Private /budgets?year=2026')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Private /budgets?year=2026')).toBeDefined();
  });

  it('returns to the requested page after sign-in', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Private /budgets?year=2026')).toBeDefined();
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it('clears protected content when another tab signs out', async () => {
    localStorage.setItem('sf_token', token());
    mount();
    await screen.findByText('Private /budgets?year=2026');
    act(() => {
      localStorage.removeItem('sf_token');
      window.dispatchEvent(new StorageEvent('storage', { key: 'sf_token', newValue: null }));
    });
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDefined();
    expect(screen.queryByText('Private /budgets?year=2026')).toBeNull();
  });

  it('expires an idle session without waiting for an API request', async () => {
    vi.useFakeTimers();
    const now = Math.floor(Date.now() / 1000) * 1000;
    vi.setSystemTime(now);
    localStorage.setItem('sf_token', token(now / 1000 + 5));
    mount();
    await act(async () => {});
    expect(screen.getByText('Private /budgets?year=2026')).toBeDefined();
    await act(async () => vi.advanceTimersByTimeAsync(5000));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDefined();
    expect(localStorage.getItem('sf_token')).toBeNull();
  });

  it('responds to server rejection of an active session', async () => {
    localStorage.setItem('sf_token', token());
    mount();
    await screen.findByText('Private /budgets?year=2026');
    act(() => {
      localStorage.removeItem('sf_token');
      window.dispatchEvent(new Event('sf:unauthorized'));
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeDefined());
  });
});
