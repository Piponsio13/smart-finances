import { API_BASE_URL } from '../config/env';
import { getToken, emitUnauthorized } from './tokenStore';

export const BASE_URL = API_BASE_URL;

export interface ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
}

export function getHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    emitUnauthorized();
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
