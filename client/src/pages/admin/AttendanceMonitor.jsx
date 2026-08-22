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
    checkInTime: '09:30:00',
    checkOutTime: '18:30:00',
    status: 'Present',
    notes: 'Regularized by HR Operations'
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
      checkInTime: rec.check_in_time || '09:30:00',
      checkOutTime: rec.check_out_time || '18:30:00',
      status: rec.status || 'Present',
      notes: rec.notes || 'Regularized by HR Operations'
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Attendance Monitor (IST)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time workforce attendance tracking, Indian Standard Time timestamps, and manual regularizations
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          icon={Download}
          isLoading={exporting}
          onClick={handleExportCSV}
          className="shadow-xs font-bold cursor-pointer"
        >
          Export CSV Sheet
        </Button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{records.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Employees on roster</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Present Today</span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{presentCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Checked in</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Late Arrivals</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{lateCount}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">After 09:30 AM IST</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider">On Leave</span>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{leaveCount}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">Approved Time-off</p>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Department */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Check In (IST)</th>
                <th className="px-6 py-3.5">Check Out (IST)</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading attendance data...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No attendance records for the selected filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id || r.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.employee_id}`}
                          alt={r.first_name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{r.first_name} {r.last_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{r.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{r.department}</td>
                    <td className="px-6 py-4 font-mono text-slate-800 dark:text-slate-200">
                      {r.check_in_time || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-800 dark:text-slate-200">
                      {r.check_out_time || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {r.work_duration_minutes
                        ? `${Math.floor(r.work_duration_minutes / 60)}h ${r.work_duration_minutes % 60}m`
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status}>{r.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => openRegularizeModal(r)}
                        className="text-xs font-semibold"
                      >
                        Regularize
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
        title="Regularize Attendance Record"
        subtitle={`Manually override shift time for ${selectedRecord?.first_name} ${selectedRecord?.last_name}`}
      >
        <form onSubmit={handleRegularizeSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Check In Time (IST)
              </label>
              <input
                type="time"
                step="1"
                value={regFormData.checkInTime}
                onChange={(e) => setRegFormData({ ...regFormData, checkInTime: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Check Out Time (IST)
              </label>
              <input
                type="time"
                step="1"
                value={regFormData.checkOutTime}
                onChange={(e) => setRegFormData({ ...regFormData, checkOutTime: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Attendance Status
            </label>
            <select
              value={regFormData.status}
              onChange={(e) => setRegFormData({ ...regFormData, status: e.target.value })}
              className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Present">Present</option>
              <option value="Late">Late Arrival</option>
              <option value="Half-day">Half-day</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              HR Justification / Notes
            </label>
            <textarea
              rows={2}
              value={regFormData.notes}
              onChange={(e) => setRegFormData({ ...regFormData, notes: e.target.value })}
              placeholder="e.g. Biometric reader sync error or client on-site visit..."
              className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
