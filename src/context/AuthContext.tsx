import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('sf_token'),
  );
  const navigate = useNavigate();

  const login = useCallback(
    (newToken: string) => {
      localStorage.setItem('sf_token', newToken);
      setToken(newToken);
      navigate('/');
    },
    [navigate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('sf_token');
    setToken(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('sf:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('sf:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
