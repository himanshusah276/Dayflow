import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Receipt,
  Users,
  ClipboardCheck,
  BarChart3,
  X,
  Sparkles,
  Building,
  CheckCircle2
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin } = useAuth();

  const employeeNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Leave & Time-Off', path: '/leaves', icon: CalendarDays },
    { name: 'Salary & Payslips', path: '/payroll', icon: Receipt },
  ];

  const adminNavLinks = [
    { name: 'HR Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Attendance Monitor', path: '/admin/attendance', icon: Clock },
    { name: 'Leave Approvals', path: '/admin/leaves', icon: ClipboardCheck },
    { name: 'Payroll & Comp', path: '/admin/payroll', icon: Receipt },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const currentNav = isAdmin ? adminNavLinks : employeeNavLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header for Mobile */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
              D
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">Dayflow HRMS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Active Role Card Badge */}
          <div className={`p-3.5 rounded-2xl border ${
            isAdmin
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200/70'
              : 'bg-gradient-to-br from-slate-50 to-blue-50/40 border-slate-200/70'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                {isAdmin ? 'HR Administration Mode' : 'Employee Self-Service'}
              </p>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.designation || 'Team Member'}
            </p>
          </div>

          {/* Links list */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Navigation
            </p>
            <nav className="space-y-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-colors" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Switch View shortcut if Admin */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Employee View
              </p>
              <nav className="space-y-1">
                <NavLink
                  to="/dashboard"
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <User className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>My Personal Dashboard</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-slate-800 truncate">Dayflow Technologies</p>
              <p className="text-[10px] text-slate-400">v1.0.0 • Production Ready</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
