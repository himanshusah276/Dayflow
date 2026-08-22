import bcrypt from 'bcryptjs';
import db from '../config/db.js';

export function seedDatabase() {
  console.log('🌱 Starting Dayflow database seeding...');

  // Clear existing data cleanly in reverse order of foreign keys
  db.exec(`
    DELETE FROM documents;
    DELETE FROM notifications;
    DELETE FROM announcements;
    DELETE FROM payroll_records;
    DELETE FROM leave_requests;
    DELETE FROM leave_balances;
    DELETE FROM attendance_records;
    DELETE FROM salary_structures;
    DELETE FROM employee_profiles;
    DELETE FROM users;
  `);

  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
  const employeePasswordHash = bcrypt.hashSync('Employee@123', 10);

  const usersData = [
    {
      empId: 'EMP-001',
      email: 'admin@dayflow.com',
      passwordHash: adminPasswordHash,
      role: 'hr_admin',
      firstName: 'Eleanor',
      lastName: 'Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0100',
      address: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      emergencyName: 'Thomas Vance',
      emergencyPhone: '+1 (415) 555-0199',
      emergencyRelation: 'Spouse',
      dob: '1988-04-12',
      gender: 'Female',
      department: 'Human Resources',
      designation: 'Director of People & Culture',
      doj: '2021-03-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Executive Board',
      location: 'HQ — San Francisco',
      bio: 'Leading people operations, culture strategy, and talent development at Dayflow.',
      basic: 9500,
      hra: 3800,
      conv: 400,
      spec: 1200,
      med: 300,
      bank: 'Silicon Valley Bank',
      acc: '**** **** 9281'
    },
    {
      empId: 'EMP-101',
      email: 'alex@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Alex',
      lastName: 'Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0101',
      address: '124 Market Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      emergencyName: 'Maria Rivera',
      emergencyPhone: '+1 (415) 555-0191',
      emergencyRelation: 'Mother',
      dob: '1993-08-22',
      gender: 'Non-Binary',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      doj: '2022-06-01',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Marcus Vance',
      location: 'HQ — San Francisco',
      bio: 'Full-stack builder passionate about scalable distributed systems and sleek UI/UX.',
      basic: 8500,
      hra: 3400,
      conv: 400,
      spec: 1000,
      med: 300,
      bank: 'Chase Bank',
      acc: '**** **** 4412'
    },
    {
      empId: 'EMP-102',
      email: 'sarah@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Sarah',
      lastName: 'Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0102',
      address: '890 Mission St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      emergencyName: 'David Chen',
      emergencyPhone: '+1 (415) 555-0192',
      emergencyRelation: 'Brother',
      dob: '1995-11-04',
      gender: 'Female',
      department: 'Design',
      designation: 'Principal Product Designer',
      doj: '2022-09-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Eleanor Vance',
      location: 'HQ — San Francisco',
      bio: 'Crafting intuitive digital experiences and design systems that delight users.',
      basic: 8000,
      hra: 3200,
      conv: 400,
      spec: 900,
      med: 300,
      bank: 'Bank of America',
      acc: '**** **** 7731'
    },
    {
      empId: 'EMP-103',
      email: 'marcus@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Marcus',
      lastName: 'Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0103',
      address: '320 Pine Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      emergencyName: 'Laura Vance',
      emergencyPhone: '+1 (415) 555-0193',
      emergencyRelation: 'Spouse',
      dob: '1990-02-18',
      gender: 'Male',
      department: 'Infrastructure',
      designation: 'Lead DevOps Engineer',
      doj: '2021-11-10',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Eleanor Vance',
      location: 'HQ — San Francisco',
      bio: 'Kubernetes, AWS cloud architecture, CI/CD observability fanatic.',
      basic: 9000,
      hra: 3600,
      conv: 400,
      spec: 1100,
      med: 300,
      bank: 'Wells Fargo',
      acc: '**** **** 1190'
    },
    {
      empId: 'EMP-104',
      email: 'priya@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Priya',
      lastName: 'Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0104',
      address: '505 Howard St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      emergencyName: 'Raj Sharma',
      emergencyPhone: '+1 (415) 555-0194',
      emergencyRelation: 'Father',
      dob: '1992-05-30',
      gender: 'Female',
      department: 'Marketing',
      designation: 'VP of Growth & Marketing',
      doj: '2023-01-10',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Eleanor Vance',
      location: 'HQ — San Francisco',
      bio: 'Scaling SaaS user acquisition, brand positioning, and lifecycle marketing campaigns.',
      basic: 8800,
      hra: 3520,
      conv: 400,
      spec: 1000,
      med: 300,
      bank: 'Chase Bank',
      acc: '**** **** 6534'
    },
    {
      empId: 'EMP-105',
      email: 'james@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'James',
      lastName: 'Wilson',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0105',
      address: '224 2nd Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94118',
      emergencyName: 'Karen Wilson',
      emergencyPhone: '+1 (415) 555-0195',
      emergencyRelation: 'Spouse',
      dob: '1991-07-14',
      gender: 'Male',
      department: 'Sales',
      designation: 'Enterprise Account Executive',
      doj: '2023-04-01',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'HQ — San Francisco',
      bio: 'Building enterprise relationships and driving HRMS tech transformation across Fortune 500s.',
      basic: 7500,
      hra: 3000,
      conv: 400,
      spec: 800,
      med: 300,
      bank: 'Citibank',
      acc: '**** **** 3321'
    },
    {
      empId: 'EMP-106',
      email: 'emily@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Emily',
      lastName: 'Taylor',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0106',
      address: '150 Castro St',
      city: 'Mountain View',
      state: 'CA',
      zipCode: '94041',
      emergencyName: 'Robert Taylor',
      emergencyPhone: '+1 (415) 555-0196',
      emergencyRelation: 'Father',
      dob: '1996-03-25',
      gender: 'Female',
      department: 'Engineering',
      designation: 'QA & Test Automation Lead',
      doj: '2023-08-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Marcus Vance',
      location: 'Remote (California)',
      bio: 'Ensuring bulletproof reliability, Cypress/Playwright test suites, and top tier software quality.',
      basic: 7200,
      hra: 2880,
      conv: 400,
      spec: 700,
      med: 300,
      bank: 'Chase Bank',
      acc: '**** **** 8820'
    },
    {
      empId: 'EMP-107',
      email: 'carlos@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Carlos',
      lastName: 'Gomez',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (415) 555-0107',
      address: '610 Broadway',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94607',
      emergencyName: 'Elena Gomez',
      emergencyPhone: '+1 (415) 555-0197',
      emergencyRelation: 'Sister',
      dob: '1994-10-10',
      gender: 'Male',
      department: 'Operations',
      designation: 'Customer Success Lead',
      doj: '2023-11-01',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Eleanor Vance',
      location: 'HQ — San Francisco',
      bio: 'Empowering customers to achieve their operational goals with world-class support.',
      basic: 6800,
      hra: 2720,
      conv: 400,
      spec: 600,
      med: 300,
      bank: 'Bank of America',
      acc: '**** **** 5592'
    }
  ];

  const currentYear = new Date().getFullYear();
  const createdUserIds = [];

  // Insert Users, Profiles, Salary Structures, Leave Balances
  for (const u of usersData) {
    const userRes = db.prepare(`
      INSERT INTO users (employee_id, email, password_hash, role, is_verified)
      VALUES (?, ?, ?, ?, 1)
    `).run(u.empId, u.email, u.passwordHash, u.role);

    const userId = userRes.lastInsertRowid;
    createdUserIds.push({ id: userId, ...u });

    db.prepare(`
      INSERT INTO employee_profiles (
        user_id, first_name, last_name, avatar_url, phone,
        address, city, state, zip_code,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        date_of_birth, gender, department, designation, date_of_joining,
        employment_type, status, reporting_manager, work_location, bio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, u.firstName, u.lastName, u.avatarUrl, u.phone,
      u.address, u.city, u.state, u.zipCode,
      u.emergencyName, u.emergencyPhone, u.emergencyRelation,
      u.dob, u.gender, u.department, u.designation, u.doj,
      u.type, u.status, u.manager, u.location, u.bio
    );

    // Salary Structure
    const gross = u.basic + u.hra + u.conv + u.spec + u.med;
    const pf = Math.round(u.basic * 0.12);
    const tax = Math.round(gross * 0.12);
    const ins = 150;
    const totalDeductions = pf + tax + ins;
    const net = gross - totalDeductions;

    db.prepare(`
      INSERT INTO salary_structures (
        user_id, currency, basic_salary, hra, conveyance_allowance, special_allowance,
        medical_allowance, provident_fund, professional_tax, health_insurance,
        gross_salary, total_deductions, net_salary, bank_name, account_number
      ) VALUES (?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, u.basic, u.hra, u.conv, u.spec, u.med, pf, tax, ins, gross, totalDeductions, net, u.bank, u.acc);

    // Leave Balances
    db.prepare(`
      INSERT INTO leave_balances (
        user_id, year, paid_leave_total, paid_leave_used,
        sick_leave_total, sick_leave_used, casual_leave_total, casual_leave_used
      ) VALUES (?, ?, 18, 3, 10, 2, 8, 1)
    `).run(userId, currentYear);
  }

  console.log(`✅ Seeded ${createdUserIds.length} users with profiles & salary structures.`);

  // Generate 30 days of attendance history for each user
  const today = new Date();
  const insertAttendance = db.prepare(`
    INSERT INTO attendance_records (
      user_id, date, check_in_time, check_out_time, work_duration_minutes, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let d = 30; d >= 0; d--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - d);
    const dayOfWeek = targetDate.getDay(); // 0 is Sun, 6 is Sat
    const dateStr = targetDate.toISOString().split('T')[0];

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const u of createdUserIds) {
      // Is today?
      if (d === 0) {
        // For today: check in most users, leave a couple pending for interactive testing
        if (u.empId === 'EMP-101' || u.empId === 'EMP-001' || u.empId === 'EMP-102' || u.empId === 'EMP-103') {
          insertAttendance.run(u.id, dateStr, '09:05:22', null, 0, 'Present', 'Checked in via Web Portal');
        } else if (u.empId === 'EMP-104') {
          insertAttendance.run(u.id, dateStr, '09:42:15', null, 0, 'Late', 'Traffic delay on Bay Bridge');
        }
        continue;
      }

      // Past days
      // Randomize attendance pattern (mostly present, occasional late, occasional leave)
      const rand = Math.random();
      let inTime, outTime, duration, status, notes;

      if (rand < 0.85) {
        // Regular Present (8:50 AM - 9:15 AM check in, 5:30 PM - 6:15 PM check out)
        const inMins = Math.floor(Math.random() * 25) + 50; // 8:50 to 9:15
        const inHour = inMins >= 60 ? 9 : 8;
        const inMin = inMins % 60;
        inTime = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`;

        const outHour = 17 + Math.floor(Math.random() * 2);
        const outMin = Math.floor(Math.random() * 59);
        outTime = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`;

        duration = (outHour * 60 + outMin) - (inHour * 60 + inMin);
        status = 'Present';
        notes = 'Regular work shift completed.';
      } else if (rand < 0.92) {
        // Late arrival
        inTime = '09:45:10';
        outTime = '18:30:00';
        duration = 525;
        status = 'Late';
        notes = 'Transit delay / Late check-in recorded.';
      } else if (rand < 0.96) {
        // Half-day
        inTime = '09:00:00';
        outTime = '13:00:00';
        duration = 240;
        status = 'Half-day';
        notes = 'Medical appointment afternoon.';
      } else {
        // On Leave
        inTime = null;
        outTime = null;
        duration = 0;
        status = 'On Leave';
        notes = 'Approved PTO';
      }

      insertAttendance.run(u.id, dateStr, inTime, outTime, duration, status, notes);
    }
  }

  console.log('✅ Seeded 30 days of realistic attendance history.');

  // Seed Leave Requests
  const adminUser = createdUserIds.find(u => u.role === 'hr_admin');
  const alexUser = createdUserIds.find(u => u.empId === 'EMP-101');
  const sarahUser = createdUserIds.find(u => u.empId === 'EMP-102');
  const marcusUser = createdUserIds.find(u => u.empId === 'EMP-103');
  const priyaUser = createdUserIds.find(u => u.empId === 'EMP-104');

  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (
      user_id, leave_type, start_date, end_date, total_days, is_half_day,
      reason, status, reviewed_by, admin_remark, reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Pending leaves for admin to review right away!
  insertLeave.run(
    alexUser.id, 'Paid', '2026-09-01', '2026-09-04', 4, 0,
    'Annual family vacation to Lake Tahoe.', 'Pending', null, null, null
  );

  insertLeave.run(
    sarahUser.id, 'Sick', '2026-08-28', '2026-08-29', 2, 0,
    'Dental surgery and post-op recovery.', 'Pending', null, null, null
  );

  insertLeave.run(
    marcusUser.id, 'Casual', '2026-09-12', '2026-09-12', 1, 0,
    'Personal errand / DMV appointment.', 'Pending', null, null, null
  );

  // Approved past leaves
  insertLeave.run(
    alexUser.id, 'Paid', '2026-07-10', '2026-07-12', 3, 0,
    'Summer hiking trip.', 'Approved', adminUser.id, 'Have a wonderful vacation!', '2026-07-02 10:30:00'
  );

  insertLeave.run(
    priyaUser.id, 'Paid', '2026-08-01', '2026-08-03', 3, 0,
    'Attending tech marketing summit.', 'Approved', adminUser.id, 'Approved. Enjoy the conference!', '2026-07-28 14:15:00'
  );

  // Rejected leave
  insertLeave.run(
    alexUser.id, 'Casual', '2026-06-20', '2026-06-20', 1, 0,
    'Impressionist art exhibition.', 'Rejected', adminUser.id, 'Critical sprint launch date on June 20th. Please reschedule.', '2026-06-18 16:00:00'
  );

  console.log('✅ Seeded Pending, Approved, and Rejected leave requests.');

  // Seed Monthly Payroll Records (last 3 months: June, July, August 2026)
  const insertPayroll = db.prepare(`
    INSERT INTO payroll_records (
      user_id, payslip_number, month, year,
      basic_pay, hra, allowances, gross_pay,
      tax_deduction, pf_deduction, insurance_deduction, total_deductions,
      net_pay, payment_status, payment_date, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?)
  `);

  const months = [
    { m: 6, y: 2026, date: '2026-06-30' },
    { m: 7, y: 2026, date: '2026-07-31' },
    { m: 8, y: 2026, date: '2026-08-31' }
  ];

  for (const u of createdUserIds) {
    const gross = u.basic + u.hra + u.conv + u.spec + u.med;
    const allowances = u.conv + u.spec + u.med;
    const pf = Math.round(u.basic * 0.12);
    const tax = Math.round(gross * 0.12);
    const ins = 150;
    const totalDeductions = pf + tax + ins;
    const net = gross - totalDeductions;

    for (const mon of months) {
      const payslipNo = `PAY-${mon.y}${String(mon.m).padStart(2, '0')}-${u.empId}`;
      insertPayroll.run(
        u.id, payslipNo, mon.m, mon.y,
        u.basic, u.hra, allowances, gross,
        tax, pf, ins, totalDeductions,
        net, mon.date, `Salary credited via Direct Deposit to ${u.bank}`
      );
    }
  }

  console.log('✅ Seeded 3 months of payroll slips for all employees.');

  // Seed Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, link, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Notifications for Alex
  insertNotif.run(alexUser.id, 'Welcome to Dayflow!', 'Explore your personal dashboard, attendance clock, and leave balances.', 'system', '/dashboard', 1);
  insertNotif.run(alexUser.id, 'Salary Slip Ready', 'Your payslip for August 2026 has been generated and is available for download.', 'payroll', '/payroll', 0);
  insertNotif.run(alexUser.id, 'Leave Request Update', 'Your Paid leave request for July 10 - July 12 was approved by HR.', 'leave', '/leaves', 1);

  // Notifications for Admin
  insertNotif.run(adminUser.id, 'New Leave Request', 'Alex Rivera requested 4 days of Paid Leave (Sep 1 - Sep 4).', 'leave', '/admin/leaves', 0);
  insertNotif.run(adminUser.id, 'New Leave Request', 'Sarah Chen requested 2 days of Sick Leave (Aug 28 - Aug 29).', 'leave', '/admin/leaves', 0);
  insertNotif.run(adminUser.id, 'System Status', 'All automated attendance logs synchronized successfully.', 'system', '/admin/attendance', 1);

  // Seed Announcements
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, content, category, is_pinned, author_name)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAnnouncement.run(
    '🎉 Dayflow Q3 Company All-Hands & Product Demo',
    'Join us this Friday at 3:00 PM PST for our quarterly town hall, product roadmap unveil, and employee spot bonus recognitions! Refreshments served in the 4th floor lounge.',
    'Events', 1, 'Eleanor Vance'
  );

  insertAnnouncement.run(
    '🌴 Upcoming Company Wellness Holiday — Labor Day',
    'Reminder that our offices will be closed on Monday, September 1st in observance of Labor Day. All essential systems will be monitored on on-call rotation.',
    'Holiday', 1, 'Human Resources'
  );

  insertAnnouncement.run(
    '💡 Annual Health & Wellness Benefit Enrollment',
    'Open enrollment for next fiscal year healthcare, dental, and gym reimbursement benefits is now open. Submit your selections by end of month in the documents section.',
    'Benefits', 0, 'People Operations'
  );

  // Seed Documents
  const insertDoc = db.prepare(`
    INSERT INTO documents (user_id, title, doc_type, file_name, file_size, file_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const u of createdUserIds) {
    insertDoc.run(u.id, 'Official Employment Agreement', 'Offer Letter', `${u.empId}_Employment_Agreement.pdf`, '1.8 MB', '/docs/sample_employment_agreement.pdf');
    insertDoc.run(u.id, 'Government ID Proof', 'ID Proof', `${u.empId}_Passport_Copy.pdf`, '2.4 MB', '/docs/sample_passport.pdf');
    insertDoc.run(u.id, 'Federal Tax Withholding W-4', 'Tax Form', `${u.empId}_W4_Form.pdf`, '620 KB', '/docs/sample_w4.pdf');
  }

  console.log('✅ Dayflow HRMS database seeded successfully!');
}

// Execute seed directly if called as a script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
