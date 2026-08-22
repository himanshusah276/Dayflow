import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5001/api';

async function req(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting Dayflow HRMS Full Automated Test Suite...\n');
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

  // 1. Health check
  await test('Backend Health API returns 200 OK', async () => {
    const res = await req('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // 2. Auth - Invalid login
  await test('Login with incorrect password returns 401 with specific error', async () => {
    const res = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@dayflow.com', password: 'WrongPassword@999' })
    });
    assert.strictEqual(res.status, 401);
    assert.ok(res.data.error.includes('Incorrect password'));
  });

  // 3. Auth - Non-existent user
  await test('Login with unregistered email returns 401 with clear message', async () => {
    const res = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@dayflow.com', password: 'Password@123' })
    });
    assert.strictEqual(res.status, 401);
    assert.ok(res.data.error.includes('No account found'));
  });

  // 4. Quick Login Admin
  let adminToken = '';
  await test('Quick Login as HR Admin succeeds and returns JWT', async () => {
    const res = await req('/auth/quick-login?role=admin');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'hr_admin');
    assert.ok(res.data.token);
    adminToken = res.data.token;
  });

  // 5. Quick Login Employee
  let employeeToken = '';
  let employeeId = 0;
  await test('Quick Login as Employee succeeds and returns role employee', async () => {
    const res = await req('/auth/quick-login?role=employee');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'employee');
    assert.ok(res.data.token);
    employeeToken = res.data.token;
    employeeId = res.data.user.id;
  });

  // 6. Get Me Profile
  await test('Get Me profile returns full employee details & unread notifications', async () => {
    const res = await req('/auth/me', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.user.firstName);
    assert.ok(res.data.user.employeeId);
  });

  // 7. Attendance - Today status
  await test('Get Today Attendance returns today status', async () => {
    const res = await req('/attendance/today', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok('isCheckedIn' in res.data);
  });

  // 8. Leaves - Balances
  await test('Get Leave Balances returns annual PTO balances', async () => {
    const res = await req('/leaves/balances', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.balance.paid_leave_total >= 18);
  });

  // 9. Leaves - Submit Leave Application
  let appliedLeaveId = 0;
  await test('Employee can apply for leave', async () => {
    const res = await req('/leaves/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` },
      body: JSON.stringify({
        leaveType: 'Paid',
        startDate: '2026-10-01',
        endDate: '2026-10-02',
        reason: 'Automated E2E Test Vacation Request',
        isHalfDay: false
      })
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.leaveId);
    appliedLeaveId = res.data.leaveId;
  });

  // 10. HR Admin - Review Leave Application
  await test('HR Admin can review and approve leave with remarks', async () => {
    const res = await req(`/leaves/${appliedLeaveId}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Approved',
        adminRemark: 'Approved via Automated Test Suite'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.request.status, 'Approved');
    assert.strictEqual(res.data.request.admin_remark, 'Approved via Automated Test Suite');
  });

  // 11. Payroll - Employee reads own structure (read-only)
  await test('Employee can fetch their own salary structure', async () => {
    const res = await req('/payroll/my-structure', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.structure.basic_salary > 0);
    assert.ok(res.data.structure.net_salary > 0);
  });

  // 12. Payroll - Generate Monthly Payroll (HR Admin)
  await test('HR Admin can generate batch monthly payroll', async () => {
    const res = await req('/payroll/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        month: 9,
        year: 2026,
        paymentDate: '2026-09-30'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.generatedCount !== undefined);
  });

  // 13. Reports - Dashboard Analytics Stats
  await test('HR Admin can fetch dashboard analytics and headcount breakdown', async () => {
    const res = await req('/reports/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.stats.activeEmployees >= 8);
    assert.ok(res.data.stats.departmentDistribution.length > 0);
    assert.ok(res.data.stats.weeklyTrend.length === 7);
  });

  // 14. RBAC Protection
  await test('Employee cannot access HR Admin endpoints (Returns 403 Forbidden)', async () => {
    const res = await req('/reports/dashboard-stats', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 403);
    assert.ok(res.data.error.includes('Access denied'));
  });

  console.log(`\n========================================`);
  console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
