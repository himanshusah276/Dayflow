import db from '../config/db.js';

// Helper to format local date string YYYY-MM-DD
function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Helper to format local time string HH:MM:SS
function getCurrentTimeString() {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
}

export const getTodayStatus = (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateString();

    const record = db.prepare(`
      SELECT * FROM attendance_records WHERE user_id = ? AND date = ?
    `).get(userId, today);

    // Calculate total hours this week for user
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const weeklyRecords = db.prepare(`
      SELECT work_duration_minutes, status, date
      FROM attendance_records
      WHERE user_id = ? AND date >= ?
    `).all(userId, startOfWeekStr);

    const totalWeeklyMinutes = weeklyRecords.reduce((sum, r) => sum + (r.work_duration_minutes || 0), 0);

    return res.json({
      todayRecord: record || null,
      isCheckedIn: record && record.check_in_time && !record.check_out_time,
      isCheckedOut: record && record.check_out_time,
      totalWeeklyMinutes,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('getTodayStatus error:', error);
    return res.status(500).json({ error: 'Failed to fetch today attendance status' });
  }
};

export const checkIn = (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateString();
    const currentTime = getCurrentTimeString();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const { notes } = req.body || {};

    let record = db.prepare('SELECT * FROM attendance_records WHERE user_id = ? AND date = ?').get(userId, today);

    if (record && record.check_in_time) {
      return res.status(400).json({ error: 'You have already checked in today.' });
    }

    // Determine status: Late if check-in is after 09:30:00
    const [hours, minutes] = currentTime.split(':').map(Number);
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? 'Late' : 'Present';

    if (record) {
      db.prepare(`
        UPDATE attendance_records
        SET check_in_time = ?, status = ?, check_in_ip = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(currentTime, status, clientIp, notes || null, record.id);
    } else {
      db.prepare(`
        INSERT INTO attendance_records (user_id, date, check_in_time, status, check_in_ip, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, today, currentTime, status, clientIp, notes || null);
    }

    record = db.prepare('SELECT * FROM attendance_records WHERE user_id = ? AND date = ?').get(userId, today);

    return res.json({
      message: `Checked in successfully at ${currentTime} (${status})`,
      record
    });
  } catch (error) {
    console.error('checkIn error:', error);
    return res.status(500).json({ error: 'Failed to check in.' });
  }
};

export const checkOut = (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateString();
    const currentTime = getCurrentTimeString();

    const record = db.prepare('SELECT * FROM attendance_records WHERE user_id = ? AND date = ?').get(userId, today);

    if (!record || !record.check_in_time) {
      return res.status(400).json({ error: 'You must check in first before checking out.' });
    }

    if (record.check_out_time) {
      return res.status(400).json({ error: 'You have already checked out today.' });
    }

    // Calculate work duration
    const inParts = record.check_in_time.split(':').map(Number);
    const outParts = currentTime.split(':').map(Number);

    const inTotalMinutes = inParts[0] * 60 + inParts[1];
    const outTotalMinutes = outParts[0] * 60 + outParts[1];
    let durationMinutes = Math.max(0, outTotalMinutes - inTotalMinutes);

    // If duration < 240 min (4 hours), consider Half-day unless already marked
    let status = record.status;
    if (durationMinutes < 240 && status !== 'Late') {
      status = 'Half-day';
    }

    db.prepare(`
      UPDATE attendance_records
      SET check_out_time = ?, work_duration_minutes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(currentTime, durationMinutes, status, record.id);

    const updatedRecord = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(record.id);

    return res.json({
      message: `Checked out successfully at ${currentTime}. Total time: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m.`,
      record: updatedRecord
    });
  } catch (error) {
    console.error('checkOut error:', error);
    return res.status(500).json({ error: 'Failed to check out.' });
  }
};

export const getMyAttendanceHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, startDate, endDate } = req.query;

    let query = `
      SELECT * FROM attendance_records
      WHERE user_id = ?
    `;
    const params = [userId];

    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (month && year) {
      const monthFormatted = String(month).padStart(2, '0');
      query += ` AND strftime('%Y-%m', date) = ?`;
      params.push(`${year}-${monthFormatted}`);
    }

    query += ` ORDER BY date DESC`;

    const records = db.prepare(query).all(...params);

    // Summary calculations
    const summary = {
      totalDays: records.length,
      presentDays: records.filter(r => r.status === 'Present' || r.status === 'Late').length,
      lateDays: records.filter(r => r.status === 'Late').length,
      halfDays: records.filter(r => r.status === 'Half-day').length,
      leaveDays: records.filter(r => r.status === 'On Leave').length,
      absentDays: records.filter(r => r.status === 'Absent').length,
      totalWorkMinutes: records.reduce((sum, r) => sum + (r.work_duration_minutes || 0), 0)
    };

    return res.json({ records, summary });
  } catch (error) {
    console.error('getMyAttendanceHistory error:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance history.' });
  }
};

export const getCompanyAttendance = (req, res) => {
  try {
    const { date, department, status, search, startDate, endDate } = req.query;

    let query = `
      SELECT a.id, a.user_id, a.date, a.check_in_time, a.check_out_time,
             a.work_duration_minutes, a.status, a.check_in_ip, a.notes, a.is_manual_override,
             u.employee_id, u.email,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation
      FROM attendance_records a
      JOIN users u ON a.user_id = u.id
      JOIN employee_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ` AND a.date = ?`;
      params.push(date);
    } else if (startDate && endDate) {
      query += ` AND a.date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else {
      // Default to today if no date filter provided
      const today = getTodayDateString();
      query += ` AND a.date = ?`;
      params.push(today);
    }

    if (department && department !== 'All') {
      query += ` AND p.department = ?`;
      params.push(department);
    }

    if (status && status !== 'All') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR u.employee_id LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY p.department ASC, p.first_name ASC`;

    const records = db.prepare(query).all(...params);

    return res.json({ records });
  } catch (error) {
    console.error('getCompanyAttendance error:', error);
    return res.status(500).json({ error: 'Failed to fetch company attendance.' });
  }
};

export const regularizeAttendance = (req, res) => {
  try {
    const { userId, date, checkInTime, checkOutTime, status, notes } = req.body;

    if (!userId || !date || !status) {
      return res.status(400).json({ error: 'User ID, date, and status are required.' });
    }

    // Compute duration if both times provided
    let durationMinutes = 0;
    if (checkInTime && checkOutTime) {
      const inParts = checkInTime.split(':').map(Number);
      const outParts = checkOutTime.split(':').map(Number);
      durationMinutes = Math.max(0, (outParts[0] * 60 + outParts[1]) - (inParts[0] * 60 + inParts[1]));
    }

    const existing = db.prepare('SELECT id FROM attendance_records WHERE user_id = ? AND date = ?').get(userId, date);

    if (existing) {
      db.prepare(`
        UPDATE attendance_records
        SET check_in_time = ?, check_out_time = ?, work_duration_minutes = ?, status = ?, notes = ?, is_manual_override = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(checkInTime || null, checkOutTime || null, durationMinutes, status, notes || 'Regularized by HR', existing.id);
    } else {
      db.prepare(`
        INSERT INTO attendance_records (user_id, date, check_in_time, check_out_time, work_duration_minutes, status, notes, is_manual_override)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(userId, date, checkInTime || null, checkOutTime || null, durationMinutes, status, notes || 'Regularized by HR');
    }

    // In-app notification to employee
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Attendance Regularized', 'Your attendance for ' || ? || ' was updated to ' || ? || ' by HR.', 'attendance')
    `).run(userId, date, status);

    return res.json({ message: 'Attendance regularized successfully.' });
  } catch (error) {
    console.error('regularizeAttendance error:', error);
    return res.status(500).json({ error: 'Failed to regularize attendance.' });
  }
};
