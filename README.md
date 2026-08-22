# Dayflow — Full-Stack Human Resource Management System (HRMS)

A production-grade, full-stack Human Resource Management System (HRMS) designed for modern companies to seamlessly manage employees, daily/weekly attendance, leave requests & approvals, salary structures, payroll runs, and HR analytics in one unified platform.

![Dayflow HRMS](https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **Two Roles**:
  - **Employee**: Self-service view of own attendance, profile, leave requests, and salary payslips.
  - **Admin / HR Officer**: Company-wide roster management, attendance regularizations, leave approvals, salary structure modifications, monthly payroll execution, and analytics.
- **Registration**: Employee ID, work email, password strength check (minimum 8 chars with mixed characters), and role selection.
- **Email Verification**: 6-digit verification code system with resend capabilities and test helpers.
- **Specific Error Feedback**: Clear validation messages for unregistered emails, invalid passwords, and unverified accounts.
- **⚡ 1-Click Demo Accounts**: One-click quick login buttons for both HR Admin and Employee on the login page for rapid evaluation.

### 2. 📊 Role-Tailored Dashboards
- **Employee Dashboard**:
  - Live **Check-In / Check-Out tracker** with active stopwatch duration timer and status badges.
  - Today's shift summary widget (Present, Late, Half-day, Leave).
  - Annual leave balance meters (Paid, Sick, Casual, Unpaid).
  - Quick-apply for leave modal.
  - Recent activity stream and company announcement board.
- **Admin / HR Dashboard**:
  - Executive KPI cards: Total Headcount, Today's Attendance Rate, Pending Leave Approvals, Monthly Total Payroll.
  - 7-day attendance trend chart (Recharts).
  - **1-Click Quick Approval Feed** for pending time-off requests.
  - Employee roster glance with direct navigation to management records.

### 3. 👤 Comprehensive Employee Profiles
- **4-Tab Profile Layout**:
  1. *Personal & Contact*: Full name, DOB, gender, address, phone, emergency contact, avatar, and bio.
  2. *Job & Organization*: Department, designation, date of joining, employment type, reporting manager, work location.
  3. *Salary Structure*: Read-only breakdown of basic pay, HRA, allowances, statutory deductions, net take-home, and bank disbursal info.
  4. *Documents*: ID proofs, contracts, tax forms (W-4), with upload capability.
- **Strict Permissions**: Employees can edit contact details, address, emergency contact, bio, and avatar. Core employment terms, department, job title, and salary remain locked for HR Admin modification only.

### 4. ⏱️ Attendance & Time-Tracking
- **Check-In / Check-Out**: Real-time timestamps with automatic status determination (*Present* on time, *Late* after 09:30 AM, *Half-day* for < 4 hours).
- **Daily & Weekly Views**: Toggle between daily detailed logs and weekly shift duration summaries.
- **Monthly Filters**: Filter by month and year.
- **HR Attendance Monitor**: Company-wide roster, date picker, department filters, and **Manual Attendance Regularization** modal.

### 5. 🌴 Leave & Time-Off Management
- **Leave Application**: Date range selector, half-day toggle, leave type selector (Paid, Sick, Casual, Unpaid), and reason textarea.
- **Automated Balance Tracking**: Prevents over-drafting beyond available entitlement.
- **HR Approval Workflow**: Filter by Pending/Approved/Rejected, 1-click Approve/Reject with optional custom review remarks.
- **Instant Synchronization**: Approving a leave automatically updates the employee's balance, marks attendance as *On Leave*, and triggers in-app notification alerts.

### 6. 💰 Payroll & Compensation
- **Salary Structures**: Basic pay, HRA, Conveyance, Special, and Medical allowances + PF, Tax (TDS), and Health Insurance deductions.
- **Monthly Payroll Execution**: HR batch payroll generator that processes and generates official payslips for all active employees.
- **Printable Payslip Voucher**: High-resolution, official salary slip template complete with company details, earnings vs deductions table, net pay, and authorized signatory line.
- **CSV Exports**: One-click export of the company-wide payroll register and attendance logs.

### 7. 🔔 In-App Notifications & Analytics
- Notification center dropdown with live unread badge, real-time read status updates, and clickable links.
- Interactive charts: Headcount by Department, Leave Types Breakdown, and Weekly Attendance Trends.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 (Vite) + Tailwind CSS + Lucide React + Recharts + React Router DOM + Canvas Confetti
- **Backend**: Node.js + Express REST API
- **Database**: SQLite (`better-sqlite3`) with relational foreign keys, transactions, WAL mode, and automated seed script
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt password hashing
- **Orchestration**: Root npm scripts with `concurrently`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/himanshusah276/Dayflow.git
   cd Dayflow
   ```

2. **Install all dependencies**:
   ```bash
   # Install root, backend, and frontend packages
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

3. **Seed the database with rich realistic company data**:
   ```bash
   npm run seed
   ```

4. **Run the full-stack application**:
   ```bash
   npm run dev
   ```
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5001`
   - **API Health Check**: `http://localhost:5001/api/health`

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Employee ID | Description |
|---|---|---|---|---|
| **HR Admin** | `admin@dayflow.com` | `Admin@123` | `EMP-001` | Eleanor Vance (Director of People & Culture) |
| **Employee** | `alex@dayflow.com` | `Employee@123` | `EMP-101` | Alex Rivera (Senior Full Stack Engineer) |
| **Employee** | `sarah@dayflow.com` | `Employee@123` | `EMP-102` | Sarah Chen (Principal Product Designer) |
| **Employee** | `marcus@dayflow.com` | `Employee@123` | `EMP-103` | Marcus Vance (Lead DevOps Engineer) |
| **Employee** | `priya@dayflow.com` | `Employee@123` | `EMP-104` | Priya Sharma (VP of Marketing) |

*(You can also use the 1-Click Demo Login buttons directly on the login page!)*

---

## 📡 REST API Architecture

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Create new employee account |
| **Auth** | `POST` | `/api/auth/login` | Public | Sign in with email & password |
| **Auth** | `POST` | `/api/auth/verify-email` | Public | 6-digit email verification code |
| **Auth** | `GET` | `/api/auth/quick-login` | Public | 1-Click demo authentication |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Fetch current profile & unread badge count |
| **Employees** | `GET` | `/api/employees` | Authenticated | List employees with search & filters |
| **Employees** | `GET` | `/api/employees/:id` | Authenticated | Get full employee profile |
| **Employees** | `PUT` | `/api/employees/:id` | Authenticated | Self-service or Admin profile update |
| **Employees** | `POST` | `/api/employees` | HR Admin | Create new employee record |
| **Employees** | `DELETE` | `/api/employees/:id` | HR Admin | Terminate/delete employee record |
| **Attendance** | `GET` | `/api/attendance/today` | Authenticated | Today's check-in status & duration |
| **Attendance** | `POST` | `/api/attendance/check-in` | Authenticated | Record check-in timestamp |
| **Attendance** | `POST` | `/api/attendance/check-out` | Authenticated | Record check-out timestamp |
| **Attendance** | `GET` | `/api/attendance/my-history` | Authenticated | Employee attendance history |
| **Attendance** | `GET` | `/api/attendance/company-history` | HR Admin | Company-wide attendance roster |
| **Attendance** | `POST` | `/api/attendance/regularize` | HR Admin | Manual attendance adjustment |
| **Leaves** | `GET` | `/api/leaves/balances` | Authenticated | Get leave entitlement balances |
| **Leaves** | `POST` | `/api/leaves/apply` | Authenticated | Submit new leave application |
| **Leaves** | `GET` | `/api/leaves/my-requests` | Authenticated | Employee leave requests history |
| **Leaves** | `GET` | `/api/leaves/all-requests` | HR Admin | Company leave requests with status filter |
| **Leaves** | `PUT` | `/api/leaves/:id/review` | HR Admin | Approve or reject leave request |
| **Payroll** | `GET` | `/api/payroll/my-structure` | Authenticated | Read-only salary structure |
| **Payroll** | `GET` | `/api/payroll/my-slips` | Authenticated | Monthly salary payslips list |
| **Payroll** | `GET` | `/api/payroll/slip/:id` | Authenticated | Detailed payslip voucher |
| **Payroll** | `GET` | `/api/payroll/structures` | HR Admin | View all salary structures |
| **Payroll** | `PUT` | `/api/payroll/structures/:userId`| HR Admin | Update salary components |
| **Payroll** | `POST` | `/api/payroll/generate` | HR Admin | Execute monthly payroll batch run |
| **Reports** | `GET` | `/api/reports/dashboard-stats` | HR Admin | Realtime analytics and counts |
| **Reports** | `GET` | `/api/reports/attendance-export` | HR Admin | Download attendance CSV |
| **Reports** | `GET` | `/api/reports/payroll-export` | HR Admin | Download payroll register CSV |

---

## 📄 License
This project is open-source under the MIT License.
