import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { setToken as setStoredToken, onUnauthorized } from '../api/tokenStore';

const TOKEN_KEY = 'sf_token';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      setStoredToken(stored);
      setToken(stored);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback((newToken: string) => {
    SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setStoredToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    SecureStore.deleteItemAsync(TOKEN_KEY);
    setStoredToken(null);
    setToken(null);
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
