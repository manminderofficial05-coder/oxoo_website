import {
  HashRouter as BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Departments from './pages/Departments';
import Designations from './pages/Designations';
import LeaveTypes from './pages/LeaveTypes';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import AttendanceSettings from './pages/AttendanceSettings';
import Holidays from './pages/Holidays';
import WorkMode from './pages/WorkMode';
import Offices from './pages/Offices';
import FaceApprovals from './pages/FaceApprovals';
import FaceSetup from './pages/FaceSetup';
import Payroll from './pages/Payroll';
import MyPayslips from './pages/MyPayslips';
import WorkHub from './pages/WorkHub';
import NeedAHand from './pages/NeedAHand';
import PremiumRoute from './components/PremiumRoute';

// Remounts the employee list when the URL query changes
// so top-bar search works from this page too.
function EmployeesRoute() {
  const { search } = useLocation();

  return <Employees key={search} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              {/* Common routes */}
              <Route index element={<Dashboard />} />
              <Route path="employees/:id" element={<EmployeeProfile />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leaves" element={<Leaves />} />
              <Route element={<PremiumRoute module="teamTasks" />}><Route path="tasks" element={<Tasks />} /><Route path="team-tasks" element={<Tasks />} /></Route>
              <Route element={<PremiumRoute module="workhub" />}><Route path="workhub" element={<WorkHub />} /></Route>
              <Route element={<PremiumRoute module="needAHand" />}><Route path="need-a-hand" element={<NeedAHand />} /></Route>
              <Route path="settings" element={<Settings />} />
              <Route path="attendance-settings" element={<AttendanceSettings />} />
              <Route path="holidays" element={<Holidays />} />
              <Route path="work-mode" element={<WorkMode />} />

              {/* Manager + Employee (people who check in and get paid) */}
              <Route element={<ProtectedRoute roles={['manager', 'employee']} />}>
                <Route path="face-setup" element={<FaceSetup />} />
                <Route path="my-payslips" element={<MyPayslips />} />
              </Route>

              {/* Admin + Manager */}
              <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
                <Route path="employees" element={<EmployeesRoute />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="departments" element={<Departments />} />
                <Route path="designations" element={<Designations />} />
                <Route path="leave-types" element={<LeaveTypes />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="offices" element={<Offices />} />
                <Route path="face-approvals" element={<FaceApprovals />} />
                <Route path="payroll" element={<Payroll />} />
              </Route>

            </Route>
          </Route>

          {/* Unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}