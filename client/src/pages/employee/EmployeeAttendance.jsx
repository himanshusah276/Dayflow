import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter,
  BarChart2
} from 'lucide-react';

export function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [historyData, todayData] = await Promise.all([
        api.getMyAttendanceHistory(selectedMonth, selectedYear),
        api.getTodayAttendance(),
      ]);
      setRecords(historyData.records || []);
      setSummary(historyData.summary || null);
      setTodayStatus(todayData || null);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await api.checkIn({ notes: 'Logged via attendance portal' });
      await fetchAttendance();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await api.checkOut();
      await fetchAttendance();
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Group records into weeks for weekly view
  const getWeeklyGroupedRecords = () => {
    const weeks = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Monday
      const weekKey = `Week of ${startOfWeek.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(r);
    });
    return weeks;
  };

  const weeklyData = getWeeklyGroupedRecords();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner with Today Status & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance & Work Shift Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily work shifts, IST check-in timestamps, and monthly attendance performance
          </p>
        </div>

        {/* Action button if not checked out */}
        <div className="flex items-center gap-3">
          {!todayStatus?.isCheckedIn && !todayStatus?.isCheckedOut && (
            <Button
              variant="primary"
              size="md"
              icon={LogIn}
              isLoading={actionLoading}
              onClick={handleCheckIn}
              className="font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              Check In Today
            </Button>
          )}

          {todayStatus?.isCheckedIn && (
            <Button
              variant="danger"
              size="md"
              icon={LogOut}
              isLoading={actionLoading}
              onClick={handleCheckOut}
              className="font-bold shadow-md shadow-rose-600/30 cursor-pointer"
            >
              Check Out ({todayStatus?.todayRecord?.check_in_time})
            </Button>
          )}

          {todayStatus?.isCheckedOut && (
            <Badge variant="Present" size="lg">
              Completed Today ({todayStatus.todayRecord.work_duration_minutes ? Math.floor(todayStatus.todayRecord.work_duration_minutes / 60) + 'h ' + (todayStatus.todayRecord.work_duration_minutes % 60) + 'm' : ''})
            </Badge>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present Days</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{summary?.presentDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">On-time & active</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary?.lateDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">After 09:30 AM IST</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Half-Days</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary?.halfDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">&lt; 4 hours shift</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leaves Taken</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{summary?.leaveDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Approved Time-off</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Work Hours</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.totalWorkMinutes ? Math.floor(summary.totalWorkMinutes / 60) : 0}h {summary?.totalWorkMinutes ? summary.totalWorkMinutes % 60 : 0}m
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Logged this month</p>
        </Card>
      </div>

      {/* View Mode & Date Filter Card */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Daily vs Weekly Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly View
            </button>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Content based on View Mode */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading attendance logs...</div>
        ) : viewMode === 'daily' ? (
          /* Daily Records Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date & Day</th>
                  <th className="px-6 py-3.5">Check In (IST)</th>
                  <th className="px-6 py-3.5">Check Out (IST)</th>
                  <th className="px-6 py-3.5">Total Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No attendance records for the selected period.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const d = new Date(r.date);
                    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
                    const dateFormatted = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {dateFormatted} <span className="text-slate-400 font-normal">({dayName})</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                          {r.check_in_time || '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                          {r.check_out_time || '—'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                          {r.work_duration_minutes
                            ? `${Math.floor(r.work_duration_minutes / 60)}h ${r.work_duration_minutes % 60}m`
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={r.status}>{r.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {r.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Weekly View Cards */
          <div className="p-6 space-y-6">
            {Object.keys(weeklyData).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No records found.</div>
            ) : (
              Object.entries(weeklyData).map(([weekName, weekRecords]) => {
                const totalMins = weekRecords.reduce((acc, curr) => acc + (curr.work_duration_minutes || 0), 0);
                return (
                  <div key={weekName} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/30">
                    <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{weekName}</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Total: {Math.floor(totalMins / 60)}h {totalMins % 60}m
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {weekRecords.map((r) => {
                        const d = new Date(r.date);
                        const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
                        return (
                          <div key={r.id} className="p-3.5 text-center space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">{dayName}</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.date.slice(5)}</p>
                            <div className="pt-1">
                              <Badge variant={r.status} size="sm">{r.status}</Badge>
                            </div>
                            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                              {r.work_duration_minutes ? `${Math.floor(r.work_duration_minutes / 60)}h ${r.work_duration_minutes % 60}m` : '0h'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
