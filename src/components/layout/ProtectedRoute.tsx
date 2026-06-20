import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

export function ProtectedRoute() {
  const { user } = useAuthenticator((context) => [context.user]);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
