import db from '../config/db.js';

export const getDashboardStats = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Total employees count
    const totalEmployees = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'employee'").get().count;
    const activeEmployees = db.prepare("SELECT COUNT(*) as count FROM employee_profiles WHERE status = 'Active'").get().count;

    // Today's attendance
    const todayRecords = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM attendance_records
      WHERE date = ?
      GROUP BY status
    `).all(today);

    const attendanceStats = {
      present: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
      absent: 0
    };

    let totalCheckedInToday = 0;
    todayRecords.forEach(r => {
      if (r.status === 'Present') attendanceStats.present = r.count;
      else if (r.status === 'Late') attendanceStats.late = r.count;
      else if (r.status === 'Half-day') attendanceStats.halfDay = r.count;
      else if (r.status === 'On Leave') attendanceStats.onLeave = r.count;
      else if (r.status === 'Absent') attendanceStats.absent = r.count;

      if (r.status === 'Present' || r.status === 'Late' || r.status === 'Half-day') {
        totalCheckedInToday += r.count;
      }
    });

    // If absent count not stored explicitly, calculate difference
    attendanceStats.absent = Math.max(0, activeEmployees - totalCheckedInToday - attendanceStats.onLeave);

    // Pending leave requests
    const pendingLeaves = db.prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'").get().count;

    // Monthly payroll summary
    const payrollCost = db.prepare(`
      SELECT SUM(gross_salary) as total_gross, SUM(net_salary) as total_net
      FROM salary_structures s
      JOIN employee_profiles p ON s.user_id = p.user_id
      WHERE p.status = 'Active'
    `).get();

    // Department distribution
    const departmentDistribution = db.prepare(`
      SELECT department, COUNT(*) as employee_count
      FROM employee_profiles
      WHERE status = 'Active'
      GROUP BY department
      ORDER BY employee_count DESC
    `).all();

    // Leave requests by type
    const leavesByType = db.prepare(`
      SELECT leave_type, COUNT(*) as count
      FROM leave_requests
      GROUP BY leave_type
    `).all();

    // Weekly attendance trend (past 7 days)
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayCounts = db.prepare(`
        SELECT
          SUM(CASE WHEN status = 'Present' OR status = 'Late' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as leave_count,
          SUM(CASE WHEN status = 'Half-day' THEN 1 ELSE 0 END) as half_day_count
        FROM attendance_records
        WHERE date = ?
      `).get(dateStr);

      past7Days.push({
        date: dateStr,
        day: dayName,
        present: dayCounts.present_count || 0,
        leave: dayCounts.leave_count || 0,
        halfDay: dayCounts.half_day_count || 0
      });
    }

    return res.json({
      stats: {
        totalEmployees,
        activeEmployees,
        todayAttendance: {
          ...attendanceStats,
          attendanceRate: activeEmployees > 0 ? Math.round((totalCheckedInToday / activeEmployees) * 100) : 0
        },
        pendingLeaves,
        payroll: {
          totalGross: payrollCost.total_gross || 0,
          totalNet: payrollCost.total_net || 0,
          currency: 'INR'
        },
        departmentDistribution,
        leavesByType,
        weeklyTrend: past7Days
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAttendanceExport = (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    let query = `
      SELECT a.date, u.employee_id, p.first_name || ' ' || p.last_name as full_name,
             p.department, p.designation, a.check_in_time, a.check_out_time,
             a.work_duration_minutes, a.status, a.notes
      FROM attendance_records a
      JOIN users u ON a.user_id = u.id
      JOIN employee_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += ` AND a.date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (department && department !== 'All') {
      query += ` AND p.department = ?`;
      params.push(department);
    }

    query += ` ORDER BY a.date DESC, p.department ASC, p.first_name ASC`;

    const records = db.prepare(query).all(...params);

    // Format as CSV
    const headers = ['Date', 'Employee ID', 'Full Name', 'Department', 'Designation', 'Check In', 'Check Out', 'Duration (Hours)', 'Status', 'Notes'];
    const rows = records.map(r => [
      r.date,
      r.employee_id,
      `"${r.full_name}"`,
      `"${r.department}"`,
      `"${r.designation}"`,
      r.check_in_time || '--',
      r.check_out_time || '--',
      (r.work_duration_minutes ? (r.work_duration_minutes / 60).toFixed(1) : '0'),
      r.status,
      `"${r.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('getAttendanceExport error:', error);
    return res.status(500).json({ error: 'Failed to export attendance report' });
  }
};

export const getPayrollExport = (req, res) => {
  try {
    const { month, year } = req.query;

    let query = `
      SELECT p.payslip_number, p.month, p.year, u.employee_id,
             ep.first_name || ' ' || ep.last_name as full_name, ep.department, ep.designation,
             p.basic_pay, p.hra, p.allowances, p.gross_pay,
             p.tax_deduction, p.pf_deduction, p.insurance_deduction, p.total_deductions,
             p.net_pay, p.payment_status, p.payment_date
      FROM payroll_records p
      JOIN users u ON p.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE 1=1
    `;
    const params = [];

    if (month && month !== 'All') {
      query += ` AND p.month = ?`;
      params.push(parseInt(month, 10));
    }

    if (year && year !== 'All') {
      query += ` AND p.year = ?`;
      params.push(parseInt(year, 10));
    }

    query += ` ORDER BY p.year DESC, p.month DESC, ep.first_name ASC`;

    const records = db.prepare(query).all(...params);

    const headers = [
      'Payslip No', 'Month/Year', 'Employee ID', 'Full Name', 'Department', 'Designation',
      'Basic Pay', 'HRA', 'Allowances', 'Gross Pay',
      'Tax', 'PF', 'Insurance', 'Total Deductions', 'Net Pay', 'Payment Status', 'Payment Date'
    ];

    const rows = records.map(r => [
      r.payslip_number,
      `${r.month}/${r.year}`,
      r.employee_id,
      `"${r.full_name}"`,
      `"${r.department}"`,
      `"${r.designation}"`,
      r.basic_pay,
      r.hra,
      r.allowances,
      r.gross_pay,
      r.tax_deduction,
      r.pf_deduction,
      r.insurance_deduction,
      r.total_deductions,
      r.net_pay,
      r.payment_status,
      r.payment_date || '--'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payroll_register_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('getPayrollExport error:', error);
    return res.status(500).json({ error: 'Failed to export payroll report' });
  }
};
