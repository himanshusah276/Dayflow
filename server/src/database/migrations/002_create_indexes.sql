-- Dayflow HRMS - Migration 002: Performance Indexes

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON employee_profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON employee_profiles(status);

CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_leaves_user_status ON leave_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_payroll_user_month_year ON payroll_records(user_id, month, year);
CREATE INDEX IF NOT EXISTS idx_payroll_payslip_no ON payroll_records(payslip_number);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
