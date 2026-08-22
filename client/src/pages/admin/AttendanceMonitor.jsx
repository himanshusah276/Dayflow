import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  Edit,
  CheckCircle2,
  AlertCircle,
  Users,
  Building,
  Sparkles
} from 'lucide-react';

export function AttendanceMonitor() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Regularize Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [regFormData, setRegFormData] = useState({
    userId: '',
    date: todayStr,
    checkInTime: '09:00:00',
    checkOutTime: '18:00:00',
    status: 'Present',
    notes: 'Regularized by HR'
  });
  const [savingReg, setSavingReg] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanyAttendance({
        date: selectedDate,
        department,
        status,
        search,
      });
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to load company attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, department, status, search]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await api.downloadAttendanceReport({
        startDate: selectedDate,
        endDate: selectedDate,
        department,
      });
    } catch (err) {
      alert(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const openRegularizeModal = (rec) => {
    setSelectedRecord(rec);
    setRegFormData({
      userId: rec.user_id,
      date: rec.date || selectedDate,
      checkInTime: rec.check_in_time || '09:00:00',
      checkOutTime: rec.check_out_time || '18:00:00',
      status: rec.status || 'Present',
      notes: rec.notes || 'Regularized by HR'
    });
    setShowRegModal(true);
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingReg(true);
      await api.regularizeAttendance(regFormData);
      setShowRegModal(false);
      await fetchAttendance();
    } catch (err) {
      alert(err.message || 'Failed to regularize attendance');
    } finally {
      setSavingReg(false);
    }
  };

  const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const leaveCount = records.filter(r => r.status === 'On Leave').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Attendance Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workforce attendance tracking, shift timestamps, and manual regularizations
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          icon={Download}
          isLoading={exporting}
          onClick={handleExportCSV}
          className="shadow-xs font-semibold"
        >
          Export CSV Sheet
        </Button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{records.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Employees on roster</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Present Today</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Checked in</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Late Arrivals</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{lateCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">After 09:30 AM</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">On Leave</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{leaveCount}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">Approved PTO</p>
        </Card>
      </div>

      {/* Filter and Date Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            {/* Date Picker */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employee by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

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
              <option value="Infrastructure">Infrastructure</option>
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half-day">Half-day</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Attendance Roster Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Check In</th>
                <th className="px-6 py-3.5">Check Out</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Remarks / IP</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">Loading attendance...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No attendance records found for this date.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.employee_id}`}
                          alt={r.first_name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{r.first_name} {r.last_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{r.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{r.department}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{r.check_in_time || '—'}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{r.check_out_time || '—'}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {r.work_duration_minutes ? `${Math.floor(r.work_duration_minutes / 60)}h ${r.work_duration_minutes % 60}m` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status}>{r.status}</Badge>
                      {r.is_manual_override === 1 && (
                        <span className="ml-1.5 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-semibold" title="Regularized by HR">
                          HR
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {r.notes || r.check_in_ip || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => openRegularizeModal(r)}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Regularize Modal */}
      <Modal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        title="Regularize / Adjust Attendance Record"
        subtitle={`Adjust attendance shift for ${selectedRecord?.first_name} ${selectedRecord?.last_name} (${selectedRecord?.date})`}
      >
        <form onSubmit={handleRegularizeSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Check In Time
              </label>
              <input
                type="text"
                value={regFormData.checkInTime}
                onChange={(e) => setRegFormData({ ...regFormData, checkInTime: e.target.value })}
                placeholder="09:00:00"
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Check Out Time
              </label>
              <input
                type="text"
                value={regFormData.checkOutTime}
                onChange={(e) => setRegFormData({ ...regFormData, checkOutTime: e.target.value })}
                placeholder="18:00:00"
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attendance Status
            </label>
            <select
              value={regFormData.status}
              onChange={(e) => setRegFormData({ ...regFormData, status: e.target.value })}
              className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half-day">Half-day</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adjustment Reason Notes
            </label>
            <textarea
              rows={2}
              value={regFormData.notes}
              onChange={(e) => setRegFormData({ ...regFormData, notes: e.target.value })}
              placeholder="e.g. Regularized due to remote meeting or biometric scanner issue"
              className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowRegModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingReg}>
              Save Regularization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
