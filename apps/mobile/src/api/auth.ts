import { BASE_URL, getHeaders, handleResponse } from './client';

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
  socialLogin: (provider: 'google' | 'apple', data: { idToken: string; nonce?: string; name?: string }) =>
    fetch(`${BASE_URL}/api/auth/social/${provider}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then((res) => handleResponse<{ token: string }>(res)),

  login: (data: LoginRequest) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<{ token: string }>(res)),

  register: (data: RegisterRequest) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleResponse<null>(res)),
};
