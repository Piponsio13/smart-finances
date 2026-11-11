export const TOKEN_KEY = 'sf_token';

// This only checks whether a token is worth sending. The API verifies its
// signature and current account before a restored session becomes authenticated.
export function tokenExpiresAt(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((part) => !/^[\w-]+$/.test(part))) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    const expiresAt = exp * 1000;
    return typeof exp === 'number' && Number.isFinite(expiresAt) ? expiresAt : null;
  } catch {
    return null;
  }
}

export function storedToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = token ? tokenExpiresAt(token) : null;
  if (!expiresAt || expiresAt <= Date.now()) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}
