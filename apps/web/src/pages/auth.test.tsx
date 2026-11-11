import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { authApi } from '../api/auth';
import { useAuth } from '../context/authState';

vi.mock('../api/auth', () => ({ authApi: { login: vi.fn(), register: vi.fn() } }));
vi.mock('../context/authState', () => ({ useAuth: vi.fn() }));
const login = vi.fn();

beforeEach(() => {
  login.mockReset();
  vi.mocked(authApi.login).mockReset();
  vi.mocked(authApi.register).mockReset();
  vi.mocked(useAuth).mockReturnValue({ token: null, isAuthenticated: false, login, logout: vi.fn() });
});
afterEach(cleanup);

function fillLogin() {
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'alice@example.com' } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'password123' } });
}

function submit(name: string) {
  fireEvent.submit(screen.getByRole('button', { name }).closest('form')!);
}

describe('authentication forms', () => {
  it('shows a failed login message and allows another attempt', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Invalid email or password'));
    render(<MemoryRouter><Login /></MemoryRouter>);
    fillLogin();
    submit('SIGN IN');
    expect(await screen.findByText('Invalid email or password')).toBeDefined();
    expect(login).not.toHaveBeenCalled();

    vi.mocked(authApi.login).mockResolvedValueOnce({ token: 'issued-token', name: 'Alice', email: 'alice@example.com' });
    submit('SIGN IN');
    await waitFor(() => expect(login).toHaveBeenCalledWith('issued-token'));
  });

  it('shows field validation messages from the API', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(Object.assign(new Error('Validation failed'), {
      fields: { email: 'Must be a valid email address' },
    }));
    render(<MemoryRouter><Login /></MemoryRouter>);
    fillLogin();
    submit('SIGN IN');
    expect(await screen.findByText('Must be a valid email address')).toBeDefined();
  });

  it('explains that signup succeeded if automatic sign-in fails', async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce(null);
    vi.mocked(authApi.login).mockRejectedValueOnce(new TypeError('Network unavailable'));
    render(<MemoryRouter><Register /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/^Full Name/), { target: { value: 'Alice' } });
    fillLogin();
    fireEvent.change(screen.getByLabelText(/^Confirm Password/), { target: { value: 'password123' } });
    submit('CREATE ACCOUNT');
    expect(await screen.findByText('Your account was created. Please use Sign In to continue.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'CREATE ACCOUNT' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('link', { name: 'SIGN IN' }).getAttribute('href')).toBe('/login');
    expect(authApi.register).toHaveBeenCalledOnce();
  });
});
