import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quick review modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' or 'Rejected'
  const [adminRemark, setAdminRemark] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, leavesData, empsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAllLeaveRequests({ status: 'Pending' }),
        api.getEmployees(),
      ]);

      setStats(statsData.stats || null);
      setPendingLeaves(leavesData.requests || []);
      setEmployees((empsData.employees || []).slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setAdminRemark(action === 'Approved' ? 'Approved by HR Operations.' : 'Unable to approve due to team schedule constraints.');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setReviewing(true);
      await api.reviewLeaveRequest(selectedLeave.id, {
        status: reviewAction,
        adminRemark
      });
      setShowReviewModal(false);
      setSelectedLeave(null);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to review leave request');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HR Management Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Company Overview & Operations
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Live workforce attendance, pending approvals, and compensation overview
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin/employees">
              <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20" icon={Users}>
                Add Employee
              </Button>
            </Link>
            <Link to="/admin/payroll">
              <Button variant="primary" size="md" className="font-bold shadow-md shadow-emerald-500/30" icon={DollarSign}>
                Process Payroll
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{stats?.activeEmployees || 8}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 6 departments</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-700">
              {stats?.todayAttendance?.present + stats?.todayAttendance?.late || 5}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats?.todayAttendance?.attendanceRate || 85}% Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.todayAttendance?.late || 1} Late • {stats?.todayAttendance?.onLeave || 1} On Leave
          </p>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Leaves</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600">
              {pendingLeaves.length}
            </span>
            {pendingLeaves.length > 0 && (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting HR approval</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Payroll</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              ${stats?.payroll?.totalGross ? (stats.payroll.totalGross / 1000).toFixed(1) + 'k' : '$64.8k'}
            </span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-mono">
              USD
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Net: ${stats?.payroll?.totalNet ? (stats.payroll.totalNet / 1000).toFixed(1) + 'k' : '$52.2k'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Weekly Attendance Chart & Quick Leave Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Weekly Workforce Attendance Trends"
            subtitle="Past 7 calendar days attendance vs leaves taken"
            action={
              <Link to="/admin/attendance" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                Full Monitor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardContent className="h-72">
            {stats?.weeklyTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="present" name="Present / Late" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="leave" name="On Leave" fill="#9333ea" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="halfDay" name="Half-day" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading attendance trends...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Pending Leave Approvals Widget */}
        <Card className="lg:col-span-1 border-amber-200/70 bg-gradient-to-b from-white to-amber-50/20">
          <CardHeader
            title="Pending Approvals"
            subtitle={`${pendingLeaves.length} requests awaiting your review`}
            action={
              <Link to="/admin/leaves" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                View all
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending leave requests at this time.</p>
              </div>
            ) : (
              pendingLeaves.map((req) => (
                <div key={req.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={req.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.employee_id}`}
                        alt={req.first_name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{req.first_name} {req.last_name}</p>
                        <p className="text-[10px] text-slate-500">{req.department}</p>
                      </div>
                    </div>
                    <Badge variant="Pending" size="sm">{req.leave_type}</Badge>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>{req.total_days} {req.total_days === 1 ? 'day' : 'days'}</strong> ({req.start_date} to {req.end_date})
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                    "{req.reason}"
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="success"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => openReviewModal(req, 'Approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => openReviewModal(req, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Employee Roster Glance */}
      <Card>
        <CardHeader
          title="Employee Directory Roster"
          subtitle="Team members across all active branches & departments"
          action={
            <Link to="/admin/employees" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
              View full directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Gross Pay</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.employee_id}`}
                        alt={emp.first_name}
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{emp.employee_id} • {emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{emp.department}</td>
                  <td className="px-6 py-4 text-slate-600">{emp.designation}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">${emp.gross_salary?.toLocaleString() || '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.status || 'Active'}>{emp.status || 'Active'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/employees?id=${emp.id}`}>
                      <Button variant="outline" size="sm">
                        Manage Record
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Leave Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Confirm ${reviewAction} Leave Request`}
        subtitle={`Request by ${selectedLeave?.first_name} ${selectedLeave?.last_name} for ${selectedLeave?.total_days} days (${selectedLeave?.leave_type})`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Decision
            </label>
            <div className="flex gap-3">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs ${
                  reviewAction === 'Approved'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="reviewAction"
                  value="Approved"
                  checked={reviewAction === 'Approved'}
                  onChange={() => setReviewAction('Approved')}
                  className="sr-only"
                />
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Approve Request
              </label>

              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs ${
                  reviewAction === 'Rejected'
                    ? 'border-rose-600 bg-rose-50 text-rose-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="reviewAction"
                  value="Rejected"
                  checked={reviewAction === 'Rejected'}
                  onChange={() => setReviewAction('Rejected')}
                  className="sr-only"
                />
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject Request
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              HR Review Remark (Visible to Employee)
            </label>
            <textarea
              rows={3}
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
              placeholder="Add remark or instructions for the employee..."
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewAction === 'Approved' ? 'primary' : 'danger'}
              isLoading={reviewing}
            >
              Confirm Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
