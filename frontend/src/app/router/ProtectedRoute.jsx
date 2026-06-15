import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { getAccessToken } from '../../shared/api/tokens.js';
import { isAdminToken } from '../../shared/lib/jwtClaims.js';

export default function ProtectedRoute({ requireAdmin = false }) {
  const { token, user, account } = useContext(AppContext);
  const accessToken = token || getAccessToken();

  if (!accessToken) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin) {
    const isAdmin =
      user?.isAdmin ||
      account?.isAdmin ||
      isAdminToken(accessToken);

    if (!isAdmin) {
      return <Navigate to="/app/admin/forbidden" replace />;
    }
  }

  return <Outlet />;
}
