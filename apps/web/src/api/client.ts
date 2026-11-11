export const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export interface ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
}

export function getHeaders(token = localStorage.getItem('sf_token')): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Only invalidate the session that actually made the rejected request. An old
// request can finish after the user has signed in again or switched accounts.
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const authorization = new Headers(init.headers).get('Authorization');
  const res = await fetch(url, init);
  if (res.status === 401 && authorization?.startsWith('Bearer ')
      && localStorage.getItem('sf_token') === authorization.slice(7)) {
    localStorage.removeItem('sf_token');
    window.dispatchEvent(new Event('sf:unauthorized'));
  }
  return res;
}

export async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const fallback = res.status === 401 ? 'Please sign in again' : `Request failed (${res.status})`;
    throw Object.assign(new Error(body?.message ?? fallback), {
      status: res.status,
      fields: body?.data,
    }) as ApiError;
  }

  if (res.status === 204) return null as T;
  if (!body || !Object.hasOwn(body, 'data')) {
    throw Object.assign(new Error('Invalid response from server'), { status: res.status }) as ApiError;
  }
  return body.data as T;
}

export function buildQueryString(params: object): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}
