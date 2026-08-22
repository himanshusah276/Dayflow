import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CalendarDays,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  Building,
  FileText,
  Megaphone,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployeeDashboard() {
  const { user } = useAuth();

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  // Leave state
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'Paid',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    isHalfDay: false
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState('');
  const [leaveError, setLeaveError] = useState('');

  // Announcements & Recent activity
  const [announcements, setAnnouncements] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  // Live timer state for active check-in
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const fetchData = async () => {
    try {
      const [todayData, summaryData, balanceData, annData, reqData] = await Promise.all([
        api.getTodayAttendance(),
        api.getMyAttendanceHistory(),
        api.getLeaveBalances(),
        api.getAnnouncements(),
        api.getMyLeaveRequests(),
      ]);

      setTodayAttendance(todayData);
      setAttendanceSummary(summaryData.summary);
      setLeaveBalance(balanceData.balance);
      setAnnouncements(annData.announcements || []);
      setRecentRequests((reqData.requests || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to load employee dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer update effect
  useEffect(() => {
    if (!todayAttendance?.isCheckedIn || !todayAttendance?.todayRecord?.check_in_time) {
      return;
    }

    const calculateElapsed = () => {
      const checkInParts = todayAttendance.todayRecord.check_in_time.split(':').map(Number);
      const now = new Date();
      const checkInDate = new Date();
      checkInDate.setHours(checkInParts[0], checkInParts[1], checkInParts[2] || 0, 0);

      const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
      const diffSecs = Math.floor(diffMs / 1000);
      const hrs = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSecs % 60).padStart(2, '0');
      setElapsedTime(`${hrs}:${mins}:${secs}`);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  const handleCheckIn = async () => {
    try {
      setAttendanceLoading(true);
      await api.checkIn({ notes: 'Checked in via web dashboard' });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setAttendanceLoading(true);
      await api.checkOut();
      await fetchData();
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveError('');
    setLeaveSuccess('');

    try {
      setLeaveSubmitting(true);
      await api.applyLeave(leaveFormData);
      setLeaveSuccess('Leave request submitted successfully for HR approval!');
      setTimeout(() => {
        setShowApplyLeaveModal(false);
        setLeaveSuccess('');
        setLeaveFormData({
          leaveType: 'Paid',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
          isHalfDay: false
        });
        fetchData();
      }, 1500);
    } catch (err) {
      setLeaveError(err.message || 'Failed to submit leave request.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Good day, {user?.firstName}!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
              <span>{user?.designation}</span> • <span>{user?.department}</span> • <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">{user?.employeeId}</span>
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowApplyLeaveModal(true)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              icon={CalendarDays}
            >
              Apply Leave
            </Button>
            <Link to="/payroll">
              <Button
                variant="primary"
                size="md"
                className="font-bold shadow-md shadow-emerald-500/30"
                icon={DollarSign}
              >
                View Salary Slips
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Check-in Card & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Check-in Action Card */}
        <Card className="lg:col-span-1 border-emerald-100 shadow-sm relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/20">
          <CardHeader
            title="Today's Attendance"
            subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            action={
              todayAttendance?.todayRecord?.status ? (
                <Badge variant={todayAttendance.todayRecord.status}>
                  {todayAttendance.todayRecord.status}
                </Badge>
              ) : (
                <Badge variant="default">Not Marked</Badge>
              )
            }
          />
          <CardContent className="space-y-5">
            {/* Live Clock / Duration Display */}
            <div className="text-center py-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {todayAttendance?.isCheckedIn ? 'Active Work Duration' : todayAttendance?.isCheckedOut ? 'Work Shift Completed' : 'Ready to Start Shift'}
              </p>
              <div className="text-4xl font-black font-mono text-slate-900 tracking-tight mt-1">
                {todayAttendance?.isCheckedIn
                  ? elapsedTime
                  : todayAttendance?.todayRecord?.work_duration_minutes
                  ? `${Math.floor(todayAttendance.todayRecord.work_duration_minutes / 60)}h ${todayAttendance.todayRecord.work_duration_minutes % 60}m`
                  : '00:00:00'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {todayAttendance?.todayRecord?.check_in_time ? (
                  <span>Checked in at <strong className="text-slate-800">{todayAttendance.todayRecord.check_in_time}</strong></span>
                ) : (
                  <span>Standard shift: 09:00 AM – 06:00 PM</span>
                )}
                {todayAttendance?.todayRecord?.check_out_time && (
                  <span> • Out at <strong className="text-slate-800">{todayAttendance.todayRecord.check_out_time}</strong></span>
                )}
              </div>
            </div>

            {/* Check-in / Out Action Buttons */}
            <div className="space-y-2">
              {!todayAttendance?.isCheckedIn && !todayAttendance?.isCheckedOut && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-emerald-600/30"
                  isLoading={attendanceLoading}
                  onClick={handleCheckIn}
                  icon={LogIn}
                >
                  Check In Now
                </Button>
              )}

              {todayAttendance?.isCheckedIn && (
                <Button
                  variant="danger"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-rose-600/30"
                  isLoading={attendanceLoading}
                  onClick={handleCheckOut}
                  icon={LogOut}
                >
                  Check Out
                </Button>
              )}

              {todayAttendance?.isCheckedOut && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    You are checked out for today. Great work!
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link to="/attendance" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                View attendance history <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balances & Attendance Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Balances Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Leave</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {(leaveBalance?.paid_leave_total || 18) - (leaveBalance?.paid_leave_used || 0)}
                </span>
                <span className="text-xs text-slate-400">/ {leaveBalance?.paid_leave_total || 18} left</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (((leaveBalance?.paid_leave_total || 18) - (leaveBalance?.paid_leave_used || 0)) / (leaveBalance?.paid_leave_total || 18)) * 100)}%`
                  }}
                />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-white border-blue-100">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Sick Leave</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {(leaveBalance?.sick_leave_total || 10) - (leaveBalance?.sick_leave_used || 0)}
                </span>
                <span className="text-xs text-slate-400">/ {leaveBalance?.sick_leave_total || 10} left</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (((leaveBalance?.sick_leave_total || 10) - (leaveBalance?.sick_leave_used || 0)) / (leaveBalance?.sick_leave_total || 10)) * 100)}%`
                  }}
                />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-white border-purple-100">
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Casual Leave</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {(leaveBalance?.casual_leave_total || 8) - (leaveBalance?.casual_leave_used || 0)}
                </span>
                <span className="text-xs text-slate-400">/ {leaveBalance?.casual_leave_total || 8} left</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (((leaveBalance?.casual_leave_total || 8) - (leaveBalance?.casual_leave_used || 0)) / (leaveBalance?.casual_leave_total || 8)) * 100)}%`
                  }}
                />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Work Hours</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {attendanceSummary?.totalWorkMinutes ? Math.floor(attendanceSummary.totalWorkMinutes / 60) : '168'}h
                </span>
                <span className="text-xs text-slate-400">this month</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                {attendanceSummary?.presentDays || 21} days logged
              </p>
            </Card>
          </div>

          {/* Recent Leave Requests & Quick Feed */}
          <Card>
            <CardHeader
              title="Recent Leave Requests"
              subtitle="Your submitted time-off applications & approval statuses"
              action={
                <Link to="/leaves" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="divide-y divide-slate-100">
              {recentRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No leave requests found.</div>
              ) : (
                recentRequests.map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{req.leave_type} Leave</p>
                          <Badge variant={req.status} size="sm">{req.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.start_date} to {req.end_date} • <strong>{req.total_days} {req.total_days === 1 ? 'day' : 'days'}</strong>
                        </p>
                        {req.admin_remark && (
                          <p className="text-[11px] text-emerald-700 font-medium mt-1 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            HR: "{req.admin_remark}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Company Announcements section */}
      <Card>
        <CardHeader
          title="Company Announcements & Updates"
          subtitle="Latest organizational news and team notices"
        />
        <div className="divide-y divide-slate-100">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
                <Megaphone className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                  {ann.is_pinned === 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                      Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {ann.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{ann.content}</p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Posted by <strong className="text-slate-700">{ann.author_name}</strong> • {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showApplyLeaveModal}
        onClose={() => setShowApplyLeaveModal(false)}
        title="Apply for Leave / Time-Off"
        subtitle="Submit a new leave application for HR approval"
      >
        {leaveError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{leaveError}</span>
          </div>
        )}

        {leaveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{leaveSuccess}</span>
          </div>
        )}

        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Leave Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={leaveFormData.leaveType}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="Paid">Paid Annual Leave ({(leaveBalance?.paid_leave_total || 18) - (leaveBalance?.paid_leave_used || 0)} days remaining)</option>
              <option value="Sick">Sick Leave ({(leaveBalance?.sick_leave_total || 10) - (leaveBalance?.sick_leave_used || 0)} days remaining)</option>
              <option value="Casual">Casual Leave ({(leaveBalance?.casual_leave_total || 8) - (leaveBalance?.casual_leave_used || 0)} days remaining)</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={leaveFormData.startDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={leaveFormData.endDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="halfDayCheck"
              checked={leaveFormData.isHalfDay}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, isHalfDay: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="halfDayCheck" className="text-xs font-medium text-slate-700">
              This is a Half-day leave request (0.5 day)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Remark <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={leaveFormData.reason}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
              placeholder="Explain the reason for time-off..."
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowApplyLeaveModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={leaveSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
