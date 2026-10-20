import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

export default function Dashboard() {
  const { user, employee } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Keeps the current data on screen while refreshing (no flash back to "Loading")
  const load = useCallback(() => {
    setError('');
    return api
      .get('/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load the dashboard. Please refresh the page.'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !data) {
    return (
      <main className="p-8">
        <div className="rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>
      </main>
    );
  }
  if (!data) return <main className="p-8 text-sm text-black/40">Loading dashboard…</main>;

  const firstName = (employee?.name || user?.name || user?.email || 'User').split(' ')[0];
  const role = (user?.role || 'employee').toLowerCase();
  if (role === 'admin') return <AdminDashboard data={data} firstName={firstName} />;
  if (role === 'manager') return <ManagerDashboard data={data} firstName={firstName} />;
  return <EmployeeDashboard data={data} firstName={firstName} onRefresh={load} />;
}