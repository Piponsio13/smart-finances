import {
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { authApi } from '../api/auth';
import { storedToken, tokenExpiresAt, TOKEN_KEY } from './session';
import { AuthContext } from './authState';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(storedToken);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<{ token: string; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const login = useCallback(
    (newToken: string) => {
      const expiresAt = tokenExpiresAt(newToken);
      if (!expiresAt || expiresAt <= Date.now()) throw new Error('Invalid session returned by server');
      localStorage.setItem(TOKEN_KEY, newToken);
      setVerifiedToken(newToken);
      setToken(newToken);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from?.startsWith('/') && !from.startsWith('//') ? from : '/', { replace: true });
    },
    [navigate, location.state],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setVerifiedToken(null);
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      // The request client already cleared the rejected token. Preserve a newer
      // session if a different tab has signed in in the meantime.
      if (!localStorage.getItem(TOKEN_KEY)) {
        setVerifiedToken(null);
        setToken(null);
      }
    };
    const syncSession = () => {
      const nextToken = storedToken();
      setToken(nextToken);
      setVerifiedToken((current) => current === nextToken ? current : null);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) syncSession();
    };
    window.addEventListener('sf:unauthorized', handleUnauthorized);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncSession);
    return () => {
      window.removeEventListener('sf:unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncSession);
    };
  }, []);

  useEffect(() => {
    if (!token || token === verifiedToken) return;
    const controller = new AbortController();
    authApi.me(token, controller.signal).then(() => {
      if (!controller.signal.aborted && localStorage.getItem(TOKEN_KEY) === token) {
        setVerifiedToken(token);
      }
    }).catch(() => {
      if (controller.signal.aborted || localStorage.getItem(TOKEN_KEY) !== token) return;
      setValidationError({ token, message: 'Unable to check your session. Please try again.' });
    });
    return () => controller.abort();
  }, [token, verifiedToken, retry]);

  useEffect(() => {
    if (!token) return;
    const expiresAt = tokenExpiresAt(token) ?? 0;
    let timeout: ReturnType<typeof setTimeout>;
    const checkExpiry = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        if (localStorage.getItem(TOKEN_KEY) === token) localStorage.removeItem(TOKEN_KEY);
        setVerifiedToken(null);
        setToken(null);
      } else {
        timeout = setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
      }
    };
    timeout = setTimeout(checkExpiry, Math.max(0, Math.min(expiresAt - Date.now(), 2_147_483_647)));
    return () => clearTimeout(timeout);
  }, [token]);

  if (token && token !== verifiedToken) {
    const message = validationError?.token === token ? validationError.message : null;
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeContent: 'center', gap: 2, p: 3 }}>
        {message ? <>
          <Alert severity="error">{message}</Alert>
          <Button onClick={() => { setValidationError(null); setRetry((value) => value + 1); }}>Try again</Button>
          <Button onClick={logout}>Sign out</Button>
        </> : <CircularProgress aria-label="Checking session" />}
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token && token === verifiedToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
