import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { VerifyEmail } from './pages/auth/VerifyEmail';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { EmployeeAttendance } from './pages/employee/EmployeeAttendance';
import { EmployeeLeaves } from './pages/employee/EmployeeLeaves';
import { EmployeePayslips } from './pages/employee/EmployeePayslips';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeDirectory } from './pages/admin/EmployeeDirectory';
import { AttendanceMonitor } from './pages/admin/AttendanceMonitor';
import { LeaveApprovals } from './pages/admin/LeaveApprovals';
import { PayrollManager } from './pages/admin/PayrollManager';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';

function ProtectedLayout() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500 animate-spin flex items-center justify-center font-bold text-white">
            D
          </div>
          <p className="text-xs font-semibold text-slate-300">Loading Dayflow HRMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RootRedirect() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedLayout />}>
            {/* Common / Employee Routes */}
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/profile" element={<EmployeeProfile />} />
            <Route path="/attendance" element={<EmployeeAttendance />} />
            <Route path="/leaves" element={<EmployeeLeaves />} />
            <Route path="/payroll" element={<EmployeePayslips />} />

            {/* Admin / HR Only Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <AdminRoute>
                  <EmployeeDirectory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <AdminRoute>
                  <AttendanceMonitor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/leaves"
              element={
                <AdminRoute>
                  <LeaveApprovals />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payroll"
              element={
                <AdminRoute>
                  <PayrollManager />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <ReportsAnalytics />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
