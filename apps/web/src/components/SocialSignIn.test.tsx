import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SocialSignIn from './SocialSignIn';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({ authApi: { socialLogin: vi.fn() } }));
const login = vi.fn();
vi.mock('../context/authState', () => ({ useAuth: () => ({ login }) }));
let googleOptions: { nonce: string; callback: (value: { credential: string }) => Promise<void> };
let appleOptions: { state: string; nonce: string };
const onError = vi.fn();
const onBusy = vi.fn();
const appleSignIn = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'google-client');
  vi.stubEnv('VITE_APPLE_CLIENT_ID', 'apple-client');
  vi.stubEnv('VITE_APPLE_REDIRECT_URI', 'https://finance.example/login');
  Object.assign(window, {
    google: { accounts: { id: { initialize: vi.fn(options => { googleOptions = options; }), renderButton: vi.fn(), cancel: vi.fn() } } },
    AppleID: { auth: { init: vi.fn(options => { appleOptions = options; }), signIn: appleSignIn } },
  });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });
async function mount() {
  render(<SocialSignIn disabled={false} onError={onError} onBusy={onBusy} />);
  await act(async () => {
    document.querySelectorAll('script[src]').forEach(script => script.dispatchEvent(new Event('load')));
  });
  await waitFor(() => expect(screen.getByRole('button', { name: /Continue with Apple/ }).hasAttribute('disabled')).toBe(false));
}
it('exchanges Google credentials with the request nonce and starts the app session', async () => {
  vi.mocked(authApi.socialLogin).mockResolvedValue({ token: 'app-token' });
  await mount();
  await act(() => googleOptions.callback({ credential: 'google-token' }));
  expect(authApi.socialLogin).toHaveBeenCalledWith('google', { idToken: 'google-token', nonce: googleOptions.nonce });
  expect(login).toHaveBeenCalledWith('app-token');
  expect(onBusy).toHaveBeenLastCalledWith(false);
});
it('rejects an Apple response with a mismatched state', async () => {
  appleSignIn.mockResolvedValue({ authorization: { id_token: 'apple-token', state: 'wrong-state' } });
  await mount();
  fireEvent.click(screen.getByRole('button', { name: /Continue with Apple/ }));
  await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringContaining('could not be verified')));
  expect(authApi.socialLogin).not.toHaveBeenCalled();
});
it('exchanges Apple credentials and surfaces API failures', async () => {
  appleSignIn.mockImplementation(async () => ({ authorization: { id_token: 'apple-token', state: appleOptions.state } }));
  vi.mocked(authApi.socialLogin).mockRejectedValue(new Error('An account with this email already exists'));
  await mount();
  fireEvent.click(screen.getByRole('button', { name: /Continue with Apple/ }));
  await waitFor(() => expect(onError).toHaveBeenCalledWith('An account with this email already exists'));
  expect(authApi.socialLogin).toHaveBeenCalledWith('apple', { idToken: 'apple-token', nonce: appleOptions.nonce, name: '' });
  expect(login).not.toHaveBeenCalled();
  expect(onBusy).toHaveBeenLastCalledWith(false);
});
