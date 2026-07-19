export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
}

export function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('sf_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('sf_token');
    window.dispatchEvent(new Event('sf:unauthorized'));
    throw Object.assign(new Error('Unauthorized'), { status: 401 }) as ApiError;
  }

  const body = await res.json();

  if (!res.ok) {
    throw Object.assign(new Error(body.message ?? 'Request failed'), {
      status: res.status,
      fields: body.data,
    }) as ApiError;
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
