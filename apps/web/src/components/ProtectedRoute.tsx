import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authState';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? <>{children}</> : (
    <Navigate to="/login" state={{ from: `${location.pathname}${location.search}${location.hash}` }} replace />
  );
}
