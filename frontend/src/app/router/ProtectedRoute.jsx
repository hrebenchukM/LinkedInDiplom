import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AppContext from '../../features/appContext/AppContext';

export default function ProtectedRoute() {
  const { token } = useContext(AppContext);

  if (!token) {
    return <Navigate to="/landing" replace />;
  }

  return <Outlet />;
}
