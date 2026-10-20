import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Client-side guard for UX only. The real enforcement is on the server.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth() || {};
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-black/50">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  const userRole = (user.role || 'employee').toLowerCase();
  if (roles && !roles.some((r) => r.toLowerCase() === userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}