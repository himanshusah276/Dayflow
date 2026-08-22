import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, Calendar, DollarSign, Info } from 'lucide-react';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function NotificationDropdown() {
  const { unreadCount, setUnreadCount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'leave': return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'attendance': return <Clock className="w-4 h-4 text-emerald-600" />;
      case 'payroll': return <DollarSign className="w-4 h-4 text-amber-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-float border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No notifications at this moment.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    notif.is_read ? 'bg-white opacity-85 hover:bg-slate-50/60' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 leading-snug">{notif.title}</p>
                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1 hover:ring-2 hover:ring-emerald-300"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 underline"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
