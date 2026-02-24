import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/auth" replace />;

  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return <Outlet />;
}
