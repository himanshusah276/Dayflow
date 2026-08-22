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
  Filter,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function EmployeeAttendance() {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Month / Year selector
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todayData, historyData] = await Promise.all([
        api.getTodayAttendance(),
        api.getMyAttendanceHistory({ month: selectedMonth, year: selectedYear }),
      ]);
      setTodayStatus(todayData);
      setRecords(historyData.records || []);
      setSummary(historyData.summary || null);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await api.checkIn({ notes: 'Checked in from Attendance View' });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Check in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await api.checkOut();
      await fetchData();
    } catch (err) {
      alert(err.message || 'Check out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Group records by week for Weekly View
  const getWeeklyGroupedRecords = () => {
    const weeks = {};
    records.forEach(r => {
      const date = new Date(r.date);
      // Get week number
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

      const weekKey = `Week ${weekNum}`;
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance & Work Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily work shifts, check-in timestamps, and monthly attendance performance
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
              className="font-bold shadow-md shadow-emerald-600/30"
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
              className="font-bold shadow-md shadow-rose-600/30"
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
        <Card className="p-4 bg-white border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present Days</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{summary?.presentDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">On-time & active</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{summary?.lateDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">After 09:30 AM</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Half-Days</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{summary?.halfDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">&lt; 4 hours shift</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leaves Taken</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{summary?.leaveDays || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Approved PTO</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Work Hours</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary?.totalWorkMinutes ? Math.floor(summary.totalWorkMinutes / 60) : 0}h {summary?.totalWorkMinutes ? summary.totalWorkMinutes % 60 : 0}m
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Logged this month</p>
        </Card>
      </div>

      {/* View Mode & Date Filter Card */}
      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Daily vs Weekly Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Content based on View Mode */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading attendance data...</div>
        ) : viewMode === 'daily' ? (
          /* Daily Records Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date & Day</th>
                  <th className="px-6 py-3.5">Check In</th>
                  <th className="px-6 py-3.5">Check Out</th>
                  <th className="px-6 py-3.5">Total Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No attendance records for the selected period.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const d = new Date(r.date);
                    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
                    const dateFormatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {dateFormatted} <span className="text-slate-400 font-normal">({dayName})</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700">
                          {r.check_in_time || '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700">
                          {r.check_out_time || '—'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {r.work_duration_minutes
                            ? `${Math.floor(r.work_duration_minutes / 60)}h ${r.work_duration_minutes % 60}m`
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={r.status}>{r.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
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
                  <div key={weekName} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30">
                    <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-xs text-slate-900">{weekName}</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Total: {Math.floor(totalMins / 60)}h {totalMins % 60}m
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white">
                      {weekRecords.map((r) => {
                        const d = new Date(r.date);
                        const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
                        return (
                          <div key={r.id} className="p-3.5 text-center space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">{dayName}</p>
                            <p className="text-xs font-bold text-slate-800">{r.date.slice(5)}</p>
                            <div className="pt-1">
                              <Badge variant={r.status} size="sm">{r.status}</Badge>
                            </div>
                            <p className="text-[11px] font-mono text-slate-600 pt-1">
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
