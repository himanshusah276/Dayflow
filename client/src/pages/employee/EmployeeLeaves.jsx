import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function EmployeeLeaves() {
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Paid',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    isHalfDay: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balData, reqData] = await Promise.all([
        api.getLeaveBalances(),
        api.getMyLeaveRequests(),
      ]);
      setBalance(balData.balance);
      setRequests(reqData.requests || []);
    } catch (err) {
      console.error('Failed to load leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      await api.applyLeave(formData);
      confetti({ particleCount: 50, spread: 60 });
      setSuccessMsg('Leave request submitted successfully for HR approval!');
      setTimeout(() => {
        setShowApplyModal(false);
        setSuccessMsg('');
        setFormData({
          leaveType: 'Paid',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
          isHalfDay: false
        });
        fetchData();
      }, 1300);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave & Time-Off Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Check your annual leave entitlement, submit time-off applications, and track approvals
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowApplyModal(true)}
          className="font-bold shadow-md shadow-emerald-600/30"
        >
          Apply for Leave
        </Button>
      </div>

      {/* Balances Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-emerald-50/60 to-white border-emerald-100">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Annual Leave</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {(balance?.paid_leave_total || 18) - (balance?.paid_leave_used || 0)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {balance?.paid_leave_total || 18} Available</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{balance?.paid_leave_used || 0} days used this year</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50/60 to-white border-blue-100">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Sick Leave</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {(balance?.sick_leave_total || 10) - (balance?.sick_leave_used || 0)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {balance?.sick_leave_total || 10} Available</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{balance?.sick_leave_used || 0} days used this year</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50/60 to-white border-purple-100">
          <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Casual Leave</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {(balance?.casual_leave_total || 8) - (balance?.casual_leave_used || 0)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {balance?.casual_leave_total || 8} Available</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{balance?.casual_leave_used || 0} days used this year</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unpaid Leave</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {balance?.unpaid_leave_used || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Days Taken</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">No entitlement limit</p>
        </Card>
      </div>

      {/* Leave Request History Table */}
      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900">My Leave Application History</h3>

          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-6 py-3.5">Dates Requested</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">HR Reviewer Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {req.leave_type} Leave
                      {req.is_half_day === 1 && (
                        <span className="ml-2 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                          Half-Day
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {req.start_date} to {req.end_date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status}>{req.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {req.admin_remark ? (
                        <span className="text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                          "{req.admin_remark}"
                        </span>
                      ) : req.status === 'Pending' ? (
                        <span className="text-slate-400 italic">Awaiting HR decision</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Leave / Time-Off"
        subtitle="Submit a new time-off application for HR review"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Leave Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="Paid">Paid Annual Leave ({(balance?.paid_leave_total || 18) - (balance?.paid_leave_used || 0)} days remaining)</option>
              <option value="Sick">Sick Leave ({(balance?.sick_leave_total || 10) - (balance?.sick_leave_used || 0)} days remaining)</option>
              <option value="Casual">Casual Leave ({(balance?.casual_leave_total || 8) - (balance?.casual_leave_used || 0)} days remaining)</option>
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
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="halfDayApply"
              checked={formData.isHalfDay}
              onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="halfDayApply" className="text-xs font-medium text-slate-700">
              Half-Day leave (0.5 day)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="State the reason for your time-off request..."
              className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
