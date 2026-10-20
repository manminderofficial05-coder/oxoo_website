import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LockedModule from './LockedModule';

export default function PremiumRoute({ module }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const isDemoPlan = user.subscription?.plan === 'demo';
  const allowed = !isDemoPlan && (user.subscription?.plan === 'professional' || user.subscription?.plan === 'enterprise' || user.subscription?.features?.[module] === true);
  return allowed ? <Outlet /> : <LockedModule module={module} />;
}
