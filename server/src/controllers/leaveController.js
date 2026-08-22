import db from '../config/db.js';

// Calculate days between two date strings (inclusive)
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export const getLeaveBalances = (req, res) => {
  try {
    const userId = req.query.userId && req.user.role === 'hr_admin' ? parseInt(req.query.userId, 10) : req.user.id;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    let balance = db.prepare(`
      SELECT * FROM leave_balances WHERE user_id = ? AND year = ?
    `).get(userId, year);

    if (!balance) {
      // Create initial record if missing
      db.prepare(`
        INSERT INTO leave_balances (user_id, year, paid_leave_total, sick_leave_total, casual_leave_total)
        VALUES (?, ?, 18, 10, 8)
      `).run(userId, year);

      balance = db.prepare(`
        SELECT * FROM leave_balances WHERE user_id = ? AND year = ?
      `).get(userId, year);
    }

    return res.json({ balance });
  } catch (error) {
    console.error('getLeaveBalances error:', error);
    return res.status(500).json({ error: 'Failed to fetch leave balances' });
  }
};

export const applyLeave = (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, reason, isHalfDay } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Please provide leave type, start date, end date, and reason.' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Start date cannot be after end date.' });
    }

    const totalDays = isHalfDay ? 0.5 : calculateDays(startDate, endDate);
    if (totalDays <= 0) {
      return res.status(400).json({ error: 'Invalid date range.' });
    }

    // Check balance for paid/sick/casual
    const currentYear = new Date(startDate).getFullYear();
    const balance = db.prepare('SELECT * FROM leave_balances WHERE user_id = ? AND year = ?').get(userId, currentYear);

    if (balance) {
      if (leaveType === 'Paid' && (balance.paid_leave_used + totalDays > balance.paid_leave_total)) {
        return res.status(400).json({
          error: `Insufficient Paid Leave balance. You have ${(balance.paid_leave_total - balance.paid_leave_used)} days remaining.`
        });
      }
      if (leaveType === 'Sick' && (balance.sick_leave_used + totalDays > balance.sick_leave_total)) {
        return res.status(400).json({
          error: `Insufficient Sick Leave balance. You have ${(balance.sick_leave_total - balance.sick_leave_used)} days remaining.`
        });
      }
      if (leaveType === 'Casual' && (balance.casual_leave_used + totalDays > balance.casual_leave_total)) {
        return res.status(400).json({
          error: `Insufficient Casual Leave balance. You have ${(balance.casual_leave_total - balance.casual_leave_used)} days remaining.`
        });
      }
    }

    const result = db.prepare(`
      INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, total_days, is_half_day, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `).run(userId, leaveType, startDate, endDate, totalDays, isHalfDay ? 1 : 0, reason);

    // Notify HR Admins
    const hrUsers = db.prepare("SELECT id FROM users WHERE role = 'hr_admin'").all();
    const employee = db.prepare('SELECT first_name, last_name FROM employee_profiles WHERE user_id = ?').get(userId);
    const empName = employee ? `${employee.first_name} ${employee.last_name}` : 'An employee';

    for (const hr of hrUsers) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, 'New Leave Request', ? || ' applied for ' || ? || ' days of ' || ? || ' leave.', 'leave', '/admin/leaves')
      `).run(hr.id, empName, totalDays, leaveType);
    }

    return res.status(201).json({
      message: 'Leave application submitted successfully. Pending HR review.',
      leaveId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('applyLeave error:', error);
    return res.status(500).json({ error: 'Failed to submit leave request.' });
  }
};

export const getMyLeaveRequests = (req, res) => {
  try {
    const userId = req.user.id;

    const requests = db.prepare(`
      SELECT lr.*,
             reviewer.first_name as reviewer_first_name,
             reviewer.last_name as reviewer_last_name
      FROM leave_requests lr
      LEFT JOIN employee_profiles reviewer ON lr.reviewed_by = reviewer.user_id
      WHERE lr.user_id = ?
      ORDER BY lr.applied_at DESC
    `).all(userId);

    return res.json({ requests });
  } catch (error) {
    console.error('getMyLeaveRequests error:', error);
    return res.status(500).json({ error: 'Failed to fetch leave requests.' });
  }
};

export const getAllLeaveRequests = (req, res) => {
  try {
    const { status, leaveType, department, search } = req.query;

    let query = `
      SELECT lr.*,
             u.employee_id, u.email,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation,
             rev.first_name as reviewer_first_name, rev.last_name as reviewer_last_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN employee_profiles p ON u.id = p.user_id
      LEFT JOIN employee_profiles rev ON lr.reviewed_by = rev.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ` AND lr.status = ?`;
      params.push(status);
    }

    if (leaveType && leaveType !== 'All') {
      query += ` AND lr.leave_type = ?`;
      params.push(leaveType);
    }

    if (department && department !== 'All') {
      query += ` AND p.department = ?`;
      params.push(department);
    }

    if (search) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR u.employee_id LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY CASE WHEN lr.status = 'Pending' THEN 1 ELSE 2 END, lr.applied_at DESC`;

    const requests = db.prepare(query).all(...params);

    return res.json({ requests });
  } catch (error) {
    console.error('getAllLeaveRequests error:', error);
    return res.status(500).json({ error: 'Failed to fetch all leave requests.' });
  }
};

export const reviewLeaveRequest = (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status, adminRemark } = req.body;
    const reviewerId = req.user.id;

    if (!status || (status !== 'Approved' && status !== 'Rejected')) {
      return res.status(400).json({ error: 'Status must be either Approved or Rejected.' });
    }

    const request = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: `This request has already been ${request.status.toLowerCase()}.` });
    }

    const currentYear = new Date(request.start_date).getFullYear();

    // Begin database transaction for atomicity
    const reviewTransaction = db.transaction(() => {
      // 1. Update leave request
      db.prepare(`
        UPDATE leave_requests
        SET status = ?, reviewed_by = ?, admin_remark = ?, reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, reviewerId, adminRemark || null, requestId);

      // 2. If Approved, update balance and attendance records
      if (status === 'Approved') {
        let balanceCol = '';
        if (request.leave_type === 'Paid') balanceCol = 'paid_leave_used';
        else if (request.leave_type === 'Sick') balanceCol = 'sick_leave_used';
        else if (request.leave_type === 'Casual') balanceCol = 'casual_leave_used';
        else if (request.leave_type === 'Unpaid') balanceCol = 'unpaid_leave_used';

        if (balanceCol) {
          db.prepare(`
            UPDATE leave_balances
            SET ${balanceCol} = ${balanceCol} + ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND year = ?
          `).run(request.total_days, request.user_id, currentYear);
        }

        // Populate attendance entries for the approved leave dates
        const start = new Date(request.start_date);
        const end = new Date(request.end_date);
        const cur = new Date(start);

        while (cur <= end) {
          const dateStr = cur.toISOString().split('T')[0];
          // Check if weekend (0 = Sunday, 6 = Saturday)
          const dayOfWeek = cur.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const existing = db.prepare('SELECT id FROM attendance_records WHERE user_id = ? AND date = ?').get(request.user_id, dateStr);
            if (existing) {
              db.prepare(`
                UPDATE attendance_records SET status = 'On Leave', notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `).run(`Approved ${request.leave_type} Leave`, existing.id);
            } else {
              db.prepare(`
                INSERT INTO attendance_records (user_id, date, status, notes)
                VALUES (?, ?, 'On Leave', ?)
              `).run(request.user_id, dateStr, `Approved ${request.leave_type} Leave`);
            }
          }
          cur.setDate(cur.getDate() + 1);
        }
      }

      // 3. Create instant in-app notification for the employee
      const statusTitle = status === 'Approved' ? 'Leave Request Approved 🎉' : 'Leave Request Update';
      const remarkNote = adminRemark ? ` Note: "${adminRemark}"` : '';
      const notifMsg = `Your ${request.leave_type} leave request for ${request.start_date} to ${request.end_date} (${request.total_days} days) has been ${status.toLowerCase()}.${remarkNote}`;

      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'leave', '/leaves')
      `).run(request.user_id, statusTitle, notifMsg);
    });

    reviewTransaction();

    const updated = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(requestId);

    return res.json({
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      request: updated
    });
  } catch (error) {
    console.error('reviewLeaveRequest error:', error);
    return res.status(500).json({ error: 'Failed to review leave request.' });
  }
};
