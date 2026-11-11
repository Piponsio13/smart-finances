import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, getHeaders, handleResponse } from './client';
import { authApi } from './auth';

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('API authentication', () => {
  it('preserves login error messages without clearing an existing session', async () => {
    localStorage.setItem('sf_token', 'existing-session');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: null, message: 'Invalid email or password', statusCode: 401,
    }), { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(authApi.login({ email: 'alice@example.com', password: 'wrong' }))
      .rejects.toMatchObject({ status: 401, message: 'Invalid email or password' });
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
    expect(localStorage.getItem('sf_token')).toBe('existing-session');
  });

  it('clears a rejected session and emits the sign-out event', async () => {
    localStorage.setItem('sf_token', 'expired-session');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    const unauthorized = vi.fn();
    window.addEventListener('sf:unauthorized', unauthorized, { once: true });

    const response = await apiFetch('/api/dashboard', { headers: getHeaders() });
    await expect(handleResponse(response)).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem('sf_token')).toBeNull();
    expect(unauthorized).toHaveBeenCalledOnce();
  });

  it('does not clear a new session when an old request returns 401', async () => {
    localStorage.setItem('sf_token', 'old-session');
    let finish!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>((resolve) => { finish = resolve; })));
    const request = apiFetch('/api/dashboard', { headers: getHeaders() });
    localStorage.setItem('sf_token', 'new-session');
    finish(new Response(null, { status: 401 }));
    await request;
    expect(localStorage.getItem('sf_token')).toBe('new-session');
  });

  it('keeps the session on permission failures', async () => {
    localStorage.setItem('sf_token', 'valid-session');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    await apiFetch('/api/dashboard', { headers: getHeaders() });
    expect(localStorage.getItem('sf_token')).toBe('valid-session');
  });

  it('handles non-JSON errors without a JSON parsing exception', async () => {
    await expect(handleResponse(new Response('Bad gateway', { status: 502 })))
      .rejects.toMatchObject({ status: 502, message: 'Request failed (502)' });
  });

  it('rejects a malformed successful response', async () => {
    await expect(handleResponse(new Response('<html>Proxy</html>')))
      .rejects.toMatchObject({ message: 'Invalid response from server' });
  });
});
