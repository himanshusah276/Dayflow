import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'dayflow.db');
const db = new Database(dbPath);

// Enable foreign keys & WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  const schema = `
    -- Users table for authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('employee', 'hr_admin')) NOT NULL DEFAULT 'employee',
      is_verified INTEGER NOT NULL DEFAULT 0,
      verification_code TEXT,
      verification_code_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Employee Profiles
    CREATE TABLE IF NOT EXISTS employee_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      avatar_url TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT DEFAULT 'United States',
      zip_code TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      emergency_contact_relation TEXT,
      date_of_birth DATE,
      gender TEXT,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      date_of_joining DATE NOT NULL,
      employment_type TEXT DEFAULT 'Full-Time',
      status TEXT CHECK(status IN ('Active', 'On Leave', 'Terminated')) DEFAULT 'Active',
      reporting_manager TEXT,
      work_location TEXT DEFAULT 'Headquarters (San Francisco)',
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Salary Structure (Annual / Monthly Components)
    CREATE TABLE IF NOT EXISTS salary_structures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      currency TEXT DEFAULT 'USD',
      basic_salary REAL NOT NULL DEFAULT 0,
      hra REAL NOT NULL DEFAULT 0,
      conveyance_allowance REAL NOT NULL DEFAULT 0,
      special_allowance REAL NOT NULL DEFAULT 0,
      medical_allowance REAL NOT NULL DEFAULT 0,
      provident_fund REAL NOT NULL DEFAULT 0,
      professional_tax REAL NOT NULL DEFAULT 0,
      health_insurance REAL NOT NULL DEFAULT 0,
      gross_salary REAL NOT NULL DEFAULT 0,
      total_deductions REAL NOT NULL DEFAULT 0,
      net_salary REAL NOT NULL DEFAULT 0,
      effective_date DATE DEFAULT (DATE('now')),
      payment_method TEXT DEFAULT 'Direct Deposit',
      bank_name TEXT,
      account_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Daily Attendance Records
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      work_duration_minutes INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('Present', 'Late', 'Half-day', 'Absent', 'On Leave')) DEFAULT 'Absent',
      check_in_ip TEXT,
      notes TEXT,
      is_manual_override INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Leave Balances per year
    CREATE TABLE IF NOT EXISTS leave_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      paid_leave_total INTEGER DEFAULT 18,
      paid_leave_used REAL DEFAULT 0,
      sick_leave_total INTEGER DEFAULT 10,
      sick_leave_used REAL DEFAULT 0,
      casual_leave_total INTEGER DEFAULT 8,
      casual_leave_used REAL DEFAULT 0,
      unpaid_leave_used REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, year),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Leave Requests
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      leave_type TEXT CHECK(leave_type IN ('Paid', 'Sick', 'Casual', 'Unpaid')) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_days REAL NOT NULL,
      is_half_day INTEGER DEFAULT 0,
      reason TEXT NOT NULL,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
      reviewed_by INTEGER,
      admin_remark TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
    );

    -- Monthly Payroll Slips
    CREATE TABLE IF NOT EXISTS payroll_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      payslip_number TEXT UNIQUE NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      basic_pay REAL NOT NULL,
      hra REAL NOT NULL,
      allowances REAL NOT NULL,
      gross_pay REAL NOT NULL,
      tax_deduction REAL NOT NULL,
      pf_deduction REAL NOT NULL,
      insurance_deduction REAL NOT NULL,
      other_deductions REAL DEFAULT 0,
      total_deductions REAL NOT NULL,
      net_pay REAL NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('Paid', 'Processing', 'Pending')) DEFAULT 'Paid',
      payment_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, month, year),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- In-App Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('leave', 'attendance', 'payroll', 'system', 'profile')) DEFAULT 'system',
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Employee Documents
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size TEXT,
      file_url TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Company Announcements
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      is_pinned INTEGER DEFAULT 0,
      author_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(schema);
}

// Auto-run schema setup on import
initSchema();

export default db;
