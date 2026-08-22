import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Menu,
  LogOut,
  User,
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronDown,
  ArrowLeftRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar({ onToggleSidebar }) {
  const { user, logout, quickLogin, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async (targetRole) => {
    setShowUserMenu(false);
    await quickLogin(targetRole);
    if (targetRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-sm shadow-emerald-500/30 text-white font-black text-lg">
            D
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              Dayflow
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                HRMS
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleSwitchRole('admin')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              isAdmin
                ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            HR Admin
          </button>
          <button
            type="button"
            onClick={() => handleSwitchRole('employee')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              !isAdmin
                ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            Employee
          </button>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.employeeId || 'User'}`}
              alt={user?.firstName || 'User'}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-semibold text-slate-900 leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 capitalize">
                {isAdmin ? 'HR Administrator' : user?.designation || 'Employee'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-float border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                  <Building2 className="w-3 h-3" />
                  {user?.department || 'Dayflow'} • {user?.employeeId}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>

                <div className="px-4 py-2 border-t border-slate-100 md:hidden">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Quick Role Switch
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSwitchRole('admin')}
                      className={`flex-1 text-[11px] py-1 px-2 rounded-lg border text-center ${isAdmin ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      HR Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchRole('employee')}
                      className={`flex-1 text-[11px] py-1 px-2 rounded-lg border text-center ${!isAdmin ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Employee
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
