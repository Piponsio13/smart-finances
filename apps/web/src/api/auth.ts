import { BASE_URL, apiFetch, getHeaders, handleResponse } from './client';

export interface AuthUser {
  name: string;
  email: string;
}

export interface LoginResponse extends AuthUser {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(null),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<LoginResponse>(res)),

  register: (data: RegisterRequest) =>
    apiFetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(null),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<null>(res)),

  me: (token: string, signal?: AbortSignal) =>
    apiFetch(`${BASE_URL}/api/auth/me`, { headers: getHeaders(token), signal })
      .then((res) => handleResponse<AuthUser>(res)),
};
