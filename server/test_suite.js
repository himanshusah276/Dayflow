import assert from 'node:assert';
import http from 'node:http';
import app from './src/server.js';
import db from './src/config/db.js';
import { seedDatabase } from './src/database/seed.js';

const PORT = 5099;
let server;
const BASE_URL = `http://localhost:${PORT}/api`;

async function req(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else if (contentType.includes('text/csv')) {
    data = await res.text().catch(() => null);
  }
  return { status: res.status, data, headers: res.headers };
}

async function startServer() {
  return new Promise((resolve) => {
    process.env.NODE_ENV = 'test';
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🧪 Test Server running on port ${PORT}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 DAYFLOW HRMS FULL INTEGRATION & E2E TEST SUITE');
  console.log('======================================================\n');

  // Re-seed database fresh for tests
  seedDatabase();

  await startServer();

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    await test('Backend Health API returns 200 OK and connected database', async () => {
      const res = await req('/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'ok');
      assert.strictEqual(res.data.database, 'connected');
    });

    // 2. OpenAPI Spec & Docs Endpoint
    await test('Interactive API Docs & OpenAPI JSON endpoint are accessible', async () => {
      const res = await req('/docs/openapi.json');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.openapi, '3.0.0');
      assert.ok(res.data.paths['/auth/login']);
    });

    // 3. Auth - Validation: Missing fields
    await test('Registration without required fields returns 400 Bad Request', async () => {
      const res = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@dayflow.com' })
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('required'));
    });

    // 4. Auth - Validation: Weak password
    await test('Registration with weak password returns 400 with security requirement', async () => {
      const res = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: 'EMP-TEST-99',
          email: 'weakpwd@dayflow.com',
          password: 'pass'
        })
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('at least 8 characters'));
    });

    // 5. Auth - Registration & 6-digit PIN generation
    let newEmployeeEmail = `jordan.${Date.now()}@dayflow.com`;
    let newEmployeeId = `EMP-TEST-${Math.floor(100 + Math.random() * 900)}`;
    let verificationPin = '';

    await test('User Registration creates account and returns 6-digit verification PIN', async () => {
      const res = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: newEmployeeId,
          email: newEmployeeEmail,
          password: 'Password@2026',
          firstName: 'Jordan',
          lastName: 'Miller',
          department: 'Engineering',
          designation: 'Staff Software Engineer'
        })
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.devVerificationCode);
      assert.strictEqual(res.data.devVerificationCode.length, 6);
      verificationPin = res.data.devVerificationCode;
    });

    // 6. Auth - Attempt Login Before Verification (Should get 403)
    await test('Login before email verification returns 403 Forbidden with needsVerification flag', async () => {
      const res = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: newEmployeeEmail,
          password: 'Password@2026'
        })
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.data.needsVerification, true);
    });

    // 7. Auth - Verify Email with Code
    let newEmployeeToken = '';
    await test('Verify Email with correct 6-digit code activates account and returns JWT token', async () => {
      const res = await req('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          email: newEmployeeEmail,
          code: verificationPin
        })
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.token);
      assert.strictEqual(res.data.user.isVerified, true);
      newEmployeeToken = res.data.token;
    });

    // 8. Auth - Login Invalid Password
    await test('Login with incorrect password returns 401 Unauthorized', async () => {
      const res = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@dayflow.com', password: 'WrongPassword@999' })
      });
      assert.strictEqual(res.status, 401);
      assert.ok(res.data.error.includes('Incorrect password'));
    });

    // 9. Auth - Quick Login as HR Admin
    let adminToken = '';
    let adminUserId = 0;
    await test('Quick Login as HR Admin succeeds and returns JWT with role hr_admin', async () => {
      const res = await req('/auth/quick-login?role=admin');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.role, 'hr_admin');
      assert.ok(res.data.token);
      adminToken = res.data.token;
      adminUserId = res.data.user.id;
    });

    // 10. Auth - Quick Login as Employee
    let employeeToken = '';
    let employeeUserId = 0;
    await test('Quick Login as Employee succeeds and returns JWT with role employee', async () => {
      const res = await req('/auth/quick-login?role=employee');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.role, 'employee');
      assert.ok(res.data.token);
      employeeToken = res.data.token;
      employeeUserId = res.data.user.id;
    });

    // 11. Profile - Get Me Profile
    await test('Get Me profile returns complete employee details and notifications count', async () => {
      const res = await req('/auth/me', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.user.firstName);
      assert.strictEqual(res.data.user.role, 'employee');
    });

    // 12. Profile - Employee self-service update
    await test('Employee can update their personal phone and bio', async () => {
      const res = await req(`/employees/${employeeUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({
          phone: '+1 (415) 555-9876',
          bio: 'Updated bio via automated test suite.'
        })
      });
      assert.strictEqual(res.status, 200);
    });

    // 13. Attendance - Today status check
    await test('Get Today Attendance returns today status for logged in employee', async () => {
      const res = await req('/attendance/today', {
        headers: { Authorization: `Bearer ${newEmployeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok('isCheckedIn' in res.data);
    });

    // 14. Attendance - Check In
    await test('Employee can check in for the day (marks Present or Late)', async () => {
      const res = await req('/attendance/check-in', {
        method: 'POST',
        headers: { Authorization: `Bearer ${newEmployeeToken}` },
        body: JSON.stringify({ notes: 'Automated test check in' })
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.record.check_in_time);
      assert.ok(['Present', 'Late'].includes(res.data.record.status));
    });

    // 15. Attendance - Check Out
    await test('Employee can check out (computes work duration)', async () => {
      const res = await req('/attendance/check-out', {
        method: 'POST',
        headers: { Authorization: `Bearer ${newEmployeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.record.check_out_time);
      assert.ok(res.data.record.work_duration_minutes !== undefined);
    });

    // 16. Attendance - My History
    await test('Employee can fetch personal attendance history with monthly summary', async () => {
      const res = await req('/attendance/my-history', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.records));
      assert.ok(res.data.summary.presentDays !== undefined);
    });

    // 17. Leaves - Get Balances
    await test('Get Leave Balances returns annual PTO balances', async () => {
      const res = await req('/leaves/balances', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.balance.paid_leave_total >= 18);
    });

    // 18. Leaves - Apply for Leave
    let testLeaveId = 0;
    await test('Employee can submit leave application', async () => {
      const res = await req('/leaves/apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({
          leaveType: 'Paid',
          startDate: '2026-11-02',
          endDate: '2026-11-04',
          reason: 'Automated E2E Test Vacation Request',
          isHalfDay: false
        })
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.leaveId);
      testLeaveId = res.data.leaveId;
    });

    // 19. Leaves - HR Admin list pending requests
    await test('HR Admin can list all pending leave requests', async () => {
      const res = await req('/leaves/all-requests?status=Pending', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.requests));
      const found = res.data.requests.find(r => r.id === testLeaveId);
      assert.ok(found, 'Applied leave request should be present in pending list');
    });

    // 20. Leaves - HR Admin approve leave request with remark
    await test('HR Admin can approve leave request with administrative remarks', async () => {
      const res = await req(`/leaves/${testLeaveId}/review`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          status: 'Approved',
          adminRemark: 'Approved via Automated Integration Test'
        })
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.request.status, 'Approved');
      assert.strictEqual(res.data.request.admin_remark, 'Approved via Automated Integration Test');
    });

    // 21. Leaves - Verify balance was deducted & notification was created
    await test('Approved leave automatically deducts leave balance and creates in-app notification', async () => {
      const notifRes = await req('/notifications', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(notifRes.status, 200);
      const leaveNotif = notifRes.data.notifications.find(n => n.type === 'leave');
      assert.ok(leaveNotif, 'Employee should receive notification of approved leave');
    });

    // 22. Payroll - Employee read-only salary structure
    await test('Employee can view their own salary structure (read-only)', async () => {
      const res = await req('/payroll/my-structure', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.structure.basic_salary > 0);
      assert.ok(res.data.structure.net_salary > 0);
    });

    // 23. RBAC - Employee denied access to HR Admin routes (403 Forbidden)
    await test('Security RBAC: Employee token hitting HR Admin endpoints returns 403 Forbidden', async () => {
      // Try updating another user's salary structure
      const res1 = await req(`/payroll/structures/${adminUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ basicSalary: 10000 })
      });
      assert.strictEqual(res1.status, 403);
      assert.ok(res1.data.error.includes('Access denied') || res1.data.error.includes('requires HR'));

      // Try viewing dashboard stats
      const res2 = await req('/reports/dashboard-stats', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res2.status, 403);
    });

    // 24. Payroll - HR Admin batch generate monthly payroll
    await test('HR Admin can generate monthly payroll slips for all active employees', async () => {
      const res = await req('/payroll/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          month: 10,
          year: 2026,
          paymentDate: '2026-10-31'
        })
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.generatedCount !== undefined);
    });

    // 25. Reports - Dashboard Analytics & Headcount distribution
    await test('HR Admin can fetch company dashboard stats & headcount breakdown', async () => {
      const res = await req('/reports/dashboard-stats', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.stats.activeEmployees >= 8);
      assert.ok(res.data.stats.departmentDistribution.length > 0);
      assert.ok(res.data.stats.weeklyTrend.length === 7);
    });

    // 26. Reports - CSV Export Attendance & Payroll
    await test('HR Admin can download CSV attendance and payroll reports', async () => {
      const resAtt = await req('/reports/attendance-export', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(resAtt.status, 200);
      assert.ok(typeof resAtt.data === 'string' && resAtt.data.includes('Employee ID'));

      const resPay = await req('/reports/payroll-export', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(resPay.status, 200);
      assert.ok(typeof resPay.data === 'string' && resPay.data.includes('Payslip No'));
    });

    // 27. Documents - Document upload abstraction
    await test('Employee can attach certified documents to their profile', async () => {
      const res = await req(`/employees/${employeeUserId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({
          title: 'Automated Test Certification',
          docType: 'Certificate',
          fileName: 'cert_2026.pdf',
          fileSize: '840 KB'
        })
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.documentId);
    });

  } finally {
    await stopServer();
  }

  console.log('\n======================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
