import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function LeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('All');
  const [leaveType, setLeaveType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [search, setSearch] = useState('');

  // Review Modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved');
  const [adminRemark, setAdminRemark] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getAllLeaveRequests({
        status,
        leaveType,
        department,
        search,
      });
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status, leaveType, department, search]);

  const openReviewModal = (req, action) => {
    setSelectedLeave(req);
    setReviewAction(action);
    setAdminRemark(action === 'Approved' ? 'Approved by HR Manager.' : 'Request declined due to project delivery schedule.');
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

      if (reviewAction === 'Approved') {
        confetti({ particleCount: 60, spread: 70 });
      }

      setShowReviewModal(false);
      setSelectedLeave(null);
      await fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave Requests & Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review employee time-off applications, manage PTO balances, and approve leaves
          </p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{requests.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Submitted all-time</p>
        </Card>

        <Card className="p-4 bg-amber-50/50 border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5 font-semibold">Requires decision</p>
        </Card>

        <Card className="p-4 bg-emerald-50/50 border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Authorized PTO</p>
        </Card>

        <Card className="p-4 bg-rose-50/50 border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Rejected</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{rejectedCount}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">Declined requests</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Leave Type */}
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Leave Types</option>
            <option value="Paid">Paid</option>
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          {/* Department */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-6 py-3.5">Date Range</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">Loading leave requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No leave requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.employee_id}`}
                          alt={req.first_name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{req.first_name} {req.last_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{req.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{req.department}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {req.leave_type}
                      {req.is_half_day === 1 && (
                        <span className="ml-1.5 text-[10px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-normal">
                          Half-day
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {req.start_date} to {req.end_date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status}>{req.status}</Badge>
                      {req.admin_remark && (
                        <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px]" title={req.admin_remark}>
                          "{req.admin_remark}"
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => openReviewModal(req, 'Approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openReviewModal(req, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Reviewed by {req.reviewer_first_name || 'HR'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Leave Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Confirm ${reviewAction} Leave Application`}
        subtitle={`Employee: ${selectedLeave?.first_name} ${selectedLeave?.last_name} • ${selectedLeave?.total_days} days (${selectedLeave?.leave_type})`}
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
                Approve Leave
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
                Reject Leave
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              HR Review Remark (Visible in employee notification & record)
            </label>
            <textarea
              rows={3}
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
              placeholder="Provide remark or rationale..."
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
              Confirm Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
