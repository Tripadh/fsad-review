import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AuthPage from '../components/auth/AuthPage';
import UserDashboard from '../components/user/UserDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import IntroPage from '../components/intro/IntroPage';

export default function AppRouter() {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <div className="page-enter" key={location.pathname}>
      <Routes location={location}>
        {/* Landing page — logged-in users skip straight to their dashboard */}
        <Route path="/"
          element={
            currentUser
              ? <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} replace />
              : <IntroPage />
          }
        />

        <Route path="/auth" element={
          currentUser
            ? <Navigate to={currentUser.role === 'admin' ? '/admin' : '/user'} replace />
            : <AuthPage />
        } />

        <Route element={<ProtectedRoute allowedRole="user" />}>
          <Route path="/user" element={<UserDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
