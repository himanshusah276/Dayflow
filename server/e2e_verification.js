import assert from 'node:assert';

const DIRECT_BACKEND_URL = 'http://localhost:5001/api';
const VITE_PROXY_URL = 'http://localhost:5173/api';
const FRONTEND_URL = 'http://localhost:5173';

async function req(endpoint, options = {}, useProxy = false) {
  const base = useProxy ? VITE_PROXY_URL : DIRECT_BACKEND_URL;
  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runVerification() {
  console.log('\n======================================================');
  console.log('⚡ DAYFLOW HRMS LIVE API & FRONTEND CONNECTIVITY TEST');
  console.log('======================================================\n');

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

  // 1. Frontend server reachability
  await test('Vite Frontend Server is reachable on http://localhost:5173', async () => {
    const res = await fetch(FRONTEND_URL);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Dayflow') || html.includes('root'));
  });

  // 2. Backend Health directly
  await test('Backend Health endpoint is live on port 5001', async () => {
    const res = await req('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
    assert.strictEqual(res.data.database, 'connected');
  });

  // 3. Backend Health via Vite Proxy
  await test('Vite Reverse Proxy correctly routes /api/health to backend', async () => {
    const res = await req('/health', {}, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // 4. Test Employee Quick Login (Aarav Patel)
  let employeeToken;
  let employeeId;
  await test('Employee Portal Login (Aarav Patel — Lead Engineer)', async () => {
    const res = await req('/auth/quick-login?role=employee', {}, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'employee');
    assert.strictEqual(res.data.user.email, 'alex@dayflow.com');
    assert.strictEqual(res.data.user.firstName, 'Aarav');
    assert.strictEqual(res.data.user.lastName, 'Patel');
    employeeToken = res.data.token;
    employeeId = res.data.user.id;
  });

  // 5. Test HR Admin Quick Login (Priya Sharma)
  let adminToken;
  await test('HR Admin Portal Login (Priya Sharma — HR Director)', async () => {
    const res = await req('/auth/quick-login?role=admin', {}, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'hr_admin');
    assert.strictEqual(res.data.user.email, 'admin@dayflow.com');
    assert.strictEqual(res.data.user.firstName, 'Priya');
    assert.strictEqual(res.data.user.lastName, 'Sharma');
    adminToken = res.data.token;
  });

  // 6. Test Employee Profile & Indian Salary Structure
  await test('Employee Profile returns INR ₹ salary & Indian location', async () => {
    const res = await req(`/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${employeeToken}` }
    }, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.employee.workLocation, 'HQ — Electronic City, Bengaluru');
    assert.strictEqual(res.data.salary.currency, 'INR');
    assert.ok(res.data.salary.gross_salary >= 100000, 'Gross salary is in realistic INR');
    assert.strictEqual(res.data.salary.professional_tax, 200, 'Professional tax is ₹200');
  });

  // 7. Test Document Upload in Employee Profile
  let uploadedDocId;
  await test('Document Upload (Aadhaar Card) in Employee Profile', async () => {
    const res = await req(`/employees/${employeeId}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` },
      body: JSON.stringify({
        title: 'Aadhaar Card Verification Copy',
        docType: 'Aadhaar Card',
        fileName: 'Aadhaar_Aarav_Patel.pdf',
        fileSize: '1.4 MB'
      })
    }, true);
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.document.id);
    uploadedDocId = res.data.document.id;
  });

  // 8. Test Document Delete
  await test('Document Deletion in Employee Profile', async () => {
    const res = await req(`/employees/${employeeId}/documents/${uploadedDocId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${employeeToken}` }
    }, true);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.message.includes('deleted'));
  });

  // 9. Test Employee Attendance Check-in and Status
  await test('Employee Attendance Shift logging', async () => {
    const res = await req('/attendance/today', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    }, true);
    assert.strictEqual(res.status, 200);
    assert.ok('isCheckedIn' in res.data);
  });

  // 10. Test Employee Payslips in INR
  await test('Employee Payslips returns monthly vouchers in ₹ INR', async () => {
    const res = await req('/payroll/my-slips', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    }, true);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.payslips.length > 0);
    const firstSlip = res.data.payslips[0];
    assert.ok(firstSlip.payslip_number.startsWith('PAY-'));
    assert.ok(firstSlip.net_pay > 50000, 'Payslip net pay is in INR');
  });

  // 11. Test Admin Dashboard Stats in INR
  await test('Admin Dashboard stats return INR payroll cost and Indian headcount', async () => {
    const res = await req('/reports/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    }, true);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.stats.activeEmployees >= 9);
    assert.strictEqual(res.data.stats.payroll.currency, 'INR');
    assert.ok(res.data.stats.weeklyTrend.length === 7);
  });

  // 12. Test Employee Directory
  await test('Admin Employee Directory returns Indian team members', async () => {
    const res = await req('/employees', {
      headers: { Authorization: `Bearer ${adminToken}` }
    }, true);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.employees.length >= 9);
    const names = res.data.employees.map(e => e.first_name);
    assert.ok(names.includes('Priya'));
    assert.ok(names.includes('Aarav'));
    assert.ok(names.includes('Ananya'));
    assert.ok(names.includes('Vikram'));
  });

  // 13. Test Leave Application and HR Approval Flow
  let leaveId;
  await test('Leave Application submission by Employee', async () => {
    const res = await req('/leaves/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` },
      body: JSON.stringify({
        leaveType: 'Paid',
        startDate: '2026-09-10',
        endDate: '2026-09-12',
        reason: 'Family function in Ahmedabad',
        isHalfDay: false
      })
    }, true);
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.leaveId);
    leaveId = res.data.leaveId;
  });

  await test('Leave Approval with remarks by HR Admin', async () => {
    const res = await req(`/leaves/${leaveId}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Approved',
        adminRemark: 'Approved by Priya Sharma (HR Operations).'
      })
    }, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.request.status, 'Approved');
  });

  // 14. Test Run Monthly Payroll
  await test('Execute Monthly INR Payroll Run for upcoming month', async () => {
    const res = await req('/payroll/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        month: 9,
        year: 2026,
        paymentDate: '2026-09-30'
      })
    }, true);
    assert.strictEqual(res.status, 200);
    assert.ok((res.data.generatedCount + res.data.skippedCount) >= 9);
  });

  console.log('\n======================================================');
  console.log(`🎉 LIVE E2E VERIFICATION: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');
}

runVerification();
