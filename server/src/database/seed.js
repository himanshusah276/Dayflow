import bcrypt from 'bcryptjs';
import db from '../config/db.js';

export function seedDatabase() {
  console.log('🌱 Starting Dayflow database seeding (Indian Context)...');

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
      firstName: 'Priya',
      lastName: 'Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      address: 'Prestige Ozone, Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560066',
      emergencyName: 'Rajesh Sharma',
      emergencyPhone: '+91 98765 43299',
      emergencyRelation: 'Spouse',
      dob: '1989-06-14',
      gender: 'Female',
      department: 'Human Resources',
      designation: 'Director of People & Culture',
      doj: '2021-02-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Executive Board',
      location: 'HQ — Electronic City, Bengaluru',
      bio: 'Leading talent development, organizational culture, and HR tech operations across Dayflow India hubs.',
      basic: 110000,
      hra: 44000,
      conv: 3000,
      spec: 28000,
      med: 2500,
      bank: 'HDFC Bank',
      acc: '**** **** 8291'
    },
    {
      empId: 'EMP-101',
      email: 'alex@dayflow.com', // Keep alex as alias for backward demo compatibility, displays as Aarav Patel
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Aarav',
      lastName: 'Patel',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98111 22334',
      address: 'Sobha Lavender, 24th Main, HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560102',
      emergencyName: 'Meera Patel',
      emergencyPhone: '+91 98111 22399',
      emergencyRelation: 'Mother',
      dob: '1994-08-22',
      gender: 'Male',
      department: 'Engineering',
      designation: 'Lead Full Stack Engineer',
      doj: '2022-04-01',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'HQ — Electronic City, Bengaluru',
      bio: 'Passionate about building scalable distributed web architectures, high throughput APIs, and slick React interfaces.',
      basic: 95000,
      hra: 38000,
      conv: 2400,
      spec: 22000,
      med: 2000,
      bank: 'ICICI Bank',
      acc: '**** **** 4412'
    },
    {
      empId: 'EMP-102',
      email: 'sarah@dayflow.com', // Displayed as Ananya Iyer
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Ananya',
      lastName: 'Iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98222 33445',
      address: 'Lodha Park, Pandurang Budhkar Marg, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400013',
      emergencyName: 'Ramesh Iyer',
      emergencyPhone: '+91 98222 33499',
      emergencyRelation: 'Father',
      dob: '1995-11-04',
      gender: 'Female',
      department: 'Design',
      designation: 'Principal Product Designer',
      doj: '2022-09-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'Regional Hub — BKC, Mumbai',
      bio: 'Crafting intuitive digital user journeys, atomic design systems, and delightful enterprise product experiences.',
      basic: 90000,
      hra: 36000,
      conv: 2400,
      spec: 18000,
      med: 2000,
      bank: 'HDFC Bank',
      acc: '**** **** 7731'
    },
    {
      empId: 'EMP-103',
      email: 'marcus@dayflow.com', // Displayed as Vikram Singh
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Vikram',
      lastName: 'Singh',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98333 44556',
      address: 'Aparna CyberLife, Nallagandla, Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      zipCode: '500019',
      emergencyName: 'Pooja Singh',
      emergencyPhone: '+91 98333 44599',
      emergencyRelation: 'Spouse',
      dob: '1991-03-18',
      gender: 'Male',
      department: 'Infrastructure',
      designation: 'Lead DevOps & Cloud Architect',
      doj: '2021-11-10',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'Regional Hub — HITEC City, Hyderabad',
      bio: 'Kubernetes orchestration, multi-region AWS cloud infra, CI/CD pipelines, and zero-downtime microservices.',
      basic: 98000,
      hra: 39200,
      conv: 2400,
      spec: 21000,
      med: 2000,
      bank: 'State Bank of India',
      acc: '**** **** 1190'
    },
    {
      empId: 'EMP-104',
      email: 'priya.sharma2@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Sneha',
      lastName: 'Reddy',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98444 55667',
      address: 'Brigade Gateway, Malleshwaram West',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560055',
      emergencyName: 'Kavita Reddy',
      emergencyPhone: '+91 98444 55699',
      emergencyRelation: 'Mother',
      dob: '1993-05-30',
      gender: 'Female',
      department: 'Marketing',
      designation: 'VP of Growth & Marketing',
      doj: '2023-01-10',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'HQ — Electronic City, Bengaluru',
      bio: 'Scaling B2B SaaS user acquisition, brand strategy, demand generation, and lifecycle retention campaigns.',
      basic: 92000,
      hra: 36800,
      conv: 2400,
      spec: 19000,
      med: 2000,
      bank: 'Axis Bank',
      acc: '**** **** 6534'
    },
    {
      empId: 'EMP-105',
      email: 'rohan@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Rohan',
      lastName: 'Deshmukh',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98555 66778',
      address: 'Rohan Mithila, Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '411014',
      emergencyName: 'Sunita Deshmukh',
      emergencyPhone: '+91 98555 66799',
      emergencyRelation: 'Spouse',
      dob: '1992-07-14',
      gender: 'Male',
      department: 'Sales',
      designation: 'Enterprise Account Executive',
      doj: '2023-04-01',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'Regional Hub — Viman Nagar, Pune',
      bio: 'Building enterprise relationships and driving HRMS digital transformation across Indian unicorns and conglomerates.',
      basic: 82000,
      hra: 32800,
      conv: 2000,
      spec: 15000,
      med: 1800,
      bank: 'Kotak Mahindra Bank',
      acc: '**** **** 3321'
    },
    {
      empId: 'EMP-106',
      email: 'neha@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Neha',
      lastName: 'Gupta',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98666 77889',
      address: 'DLF The Crest, Sector 54, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      zipCode: '122002',
      emergencyName: 'Alok Gupta',
      emergencyPhone: '+91 98666 77899',
      emergencyRelation: 'Father',
      dob: '1996-03-25',
      gender: 'Female',
      department: 'Engineering',
      designation: 'Lead QA & Automation Engineer',
      doj: '2023-08-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Aarav Patel',
      location: 'Regional Hub — Cyber City, Gurugram',
      bio: 'End-to-end test automation specialist ensuring highest reliability, performance SLAs, and bulletproof releases.',
      basic: 78000,
      hra: 31200,
      conv: 2000,
      spec: 14000,
      med: 1800,
      bank: 'HDFC Bank',
      acc: '**** **** 9087'
    },
    {
      empId: 'EMP-107',
      email: 'aditya@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Aditya',
      lastName: 'Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98777 88990',
      address: 'Olympia Opaline, Navalur, OMR',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      zipCode: '600130',
      emergencyName: 'Sanjay Verma',
      emergencyPhone: '+91 98777 88999',
      emergencyRelation: 'Brother',
      dob: '1997-12-10',
      gender: 'Male',
      department: 'Engineering',
      designation: 'Data & AI Engineer',
      doj: '2024-01-15',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Aarav Patel',
      location: 'Regional Hub — Guindy, Chennai',
      bio: 'Building machine learning pipelines, HR analytics models, and intelligent automated workflows.',
      basic: 74000,
      hra: 29600,
      conv: 2000,
      spec: 13000,
      med: 1800,
      bank: 'State Bank of India',
      acc: '**** **** 5521'
    },
    {
      empId: 'EMP-108',
      email: 'pooja@dayflow.com',
      passwordHash: employeePasswordHash,
      role: 'employee',
      firstName: 'Pooja',
      lastName: 'Nair',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98888 99001',
      address: 'Purva Riviera, Marathahalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560037',
      emergencyName: 'Deepak Nair',
      emergencyPhone: '+91 98888 99099',
      emergencyRelation: 'Spouse',
      dob: '1995-09-18',
      gender: 'Female',
      department: 'Human Resources',
      designation: 'HR Operations Specialist',
      doj: '2023-06-01',
      type: 'Full-Time',
      status: 'Active',
      manager: 'Priya Sharma',
      location: 'HQ — Electronic City, Bengaluru',
      bio: 'Facilitating employee onboarding, statutory compliance, payroll coordination, and employee engagement programs.',
      basic: 68000,
      hra: 27200,
      conv: 2000,
      spec: 12000,
      med: 1800,
      bank: 'ICICI Bank',
      acc: '**** **** 1289'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (employee_id, email, password_hash, role, is_verified, created_at)
    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
  `);

  const insertProfile = db.prepare(`
    INSERT INTO employee_profiles (
      user_id, first_name, last_name, avatar_url, phone, address, city, state, country, zip_code,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
      date_of_birth, gender, department, designation, date_of_joining,
      employment_type, status, reporting_manager, work_location, bio
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSalary = db.prepare(`
    INSERT INTO salary_structures (
      user_id, currency, basic_salary, hra, conveyance_allowance, special_allowance,
      medical_allowance, provident_fund, professional_tax, health_insurance,
      gross_salary, total_deductions, net_salary, effective_date, payment_method, bank_name, account_number
    ) VALUES (?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now', '-6 months'), 'NEFT / Direct Bank Transfer', ?, ?)
  `);

  const insertLeaveBalance = db.prepare(`
    INSERT INTO leave_balances (
      user_id, year, paid_leave_total, paid_leave_used, sick_leave_total, sick_leave_used, casual_leave_total, casual_leave_used, unpaid_leave_used
    ) VALUES (?, ?, 18, ?, 10, ?, 8, ?, 0)
  `);

  const createdUserIds = [];

  for (const u of usersData) {
    const userRes = insertUser.run(u.empId, u.email, u.passwordHash, u.role);
    const userId = userRes.lastInsertRowid;
    createdUserIds.push({ id: userId, ...u });

    insertProfile.run(
      userId, u.firstName, u.lastName, u.avatarUrl, u.phone, u.address, u.city, u.state, u.country || 'India', u.zipCode,
      u.emergencyName, u.emergencyPhone, u.emergencyRelation,
      u.dob, u.gender, u.department, u.designation, u.doj,
      u.type, u.status, u.manager, u.location, u.bio
    );

    // Standard Indian compensation components
    const gross = u.basic + u.hra + u.conv + u.spec + u.med;
    const pf = Math.round(u.basic * 0.12); // EPF @ 12% of basic
    const pt = 200; // Professional Tax standard ₹200/mo
    const tax = Math.round(gross * 0.10); // Standard TDS estimate ~10%
    const healthIns = 750; // Group Health Insurance premium
    const totalDeductions = pf + pt + tax + healthIns;
    const net = gross - totalDeductions;

    insertSalary.run(
      userId, u.basic, u.hra, u.conv, u.spec,
      u.med, pf, pt, healthIns,
      gross, totalDeductions, net, u.bank, u.acc
    );

    const currentYear = new Date().getFullYear();
    const paidUsed = Math.floor(Math.random() * 5);
    const sickUsed = Math.floor(Math.random() * 3);
    const casualUsed = Math.floor(Math.random() * 2);

    insertLeaveBalance.run(userId, currentYear, paidUsed, sickUsed, casualUsed);
  }

  console.log(`✅ Seeded ${createdUserIds.length} Indian employee profiles & salary structures.`);

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
      if (d === 0) {
        // Today's attendance
        if (u.empId === 'EMP-101' || u.empId === 'EMP-001' || u.empId === 'EMP-102' || u.empId === 'EMP-103') {
          insertAttendance.run(u.id, dateStr, '09:12:18', null, 0, 'Present', 'Checked in via Dayflow Web Portal');
        } else if (u.empId === 'EMP-104') {
          insertAttendance.run(u.id, dateStr, '09:48:30', null, 0, 'Late', 'Silk Board junction traffic delay');
        }
        continue;
      }

      const rand = Math.random();
      let inTime, outTime, duration, status, notes;

      if (rand < 0.86) {
        const inMins = Math.floor(Math.random() * 25) + 50; // 8:50 to 9:15 AM
        const inHour = inMins >= 60 ? 9 : 8;
        const inMin = inMins % 60;
        inTime = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`;

        const outHour = 18 + Math.floor(Math.random() * 2);
        const outMin = Math.floor(Math.random() * 59);
        outTime = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`;

        duration = (outHour * 60 + outMin) - (inHour * 60 + inMin);
        status = 'Present';
        notes = 'Standard shift completed.';
      } else if (rand < 0.93) {
        inTime = '09:50:15';
        outTime = '18:45:00';
        duration = 535;
        status = 'Late';
        notes = 'Metro train delay / Late check-in.';
      } else if (rand < 0.96) {
        inTime = '09:00:00';
        outTime = '13:30:00';
        duration = 270;
        status = 'Half-day';
        notes = 'First half present / personal half-day.';
      } else {
        inTime = null;
        outTime = null;
        duration = 0;
        status = 'On Leave';
        notes = 'Approved Leave';
      }

      insertAttendance.run(u.id, dateStr, inTime, outTime, duration, status, notes);
    }
  }

  console.log('✅ Seeded 30 days of realistic attendance history.');

  // Seed Leave Requests
  const adminUser = createdUserIds.find(u => u.role === 'hr_admin');
  const aaravUser = createdUserIds.find(u => u.empId === 'EMP-101');
  const ananyaUser = createdUserIds.find(u => u.empId === 'EMP-102');
  const vikramUser = createdUserIds.find(u => u.empId === 'EMP-103');
  const snehaUser = createdUserIds.find(u => u.empId === 'EMP-104');

  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (
      user_id, leave_type, start_date, end_date, total_days, is_half_day,
      reason, status, reviewed_by, admin_remark, reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Pending leaves for admin to review
  insertLeave.run(
    aaravUser.id, 'Paid', '2026-09-02', '2026-09-05', 4, 0,
    'Family trip to Coorg & Wayanad.', 'Pending', null, null, null
  );

  insertLeave.run(
    ananyaUser.id, 'Sick', '2026-08-28', '2026-08-29', 2, 0,
    'Dental surgery and post-procedure rest.', 'Pending', null, null, null
  );

  insertLeave.run(
    vikramUser.id, 'Casual', '2026-09-15', '2026-09-15', 1, 0,
    'Regional RTO driving license renewal appointment.', 'Pending', null, null, null
  );

  // Approved past leaves
  insertLeave.run(
    aaravUser.id, 'Paid', '2026-07-15', '2026-07-18', 4, 0,
    'Monsoon trek to Western Ghats.', 'Approved', adminUser.id, 'Approved! Enjoy your trek.', '2026-07-08 11:30:00'
  );

  insertLeave.run(
    snehaUser.id, 'Paid', '2026-08-03', '2026-08-05', 3, 0,
    'Attending B2B SaaS India Summit in Bengaluru.', 'Approved', adminUser.id, 'Approved. Please share key learnings with team!', '2026-07-29 15:20:00'
  );

  // Rejected leave
  insertLeave.run(
    aaravUser.id, 'Casual', '2026-06-25', '2026-06-25', 1, 0,
    'Music concert in Mumbai.', 'Rejected', adminUser.id, 'Major sprint production release scheduled on June 25th.', '2026-06-21 16:00:00'
  );

  console.log('✅ Seeded Pending, Approved, and Rejected leave requests.');

  // Seed Monthly Payroll Records (last 3 months: June, July, August 2026) in INR
  const insertPayroll = db.prepare(`
    INSERT INTO payroll_records (
      user_id, payslip_number, month, year,
      basic_pay, hra, allowances, gross_pay,
      tax_deduction, pf_deduction, insurance_deduction, other_deductions, total_deductions,
      net_pay, payment_status, payment_date, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?)
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
    const pt = 200;
    const tax = Math.round(gross * 0.10);
    const ins = 750;
    const totalDeductions = pf + pt + tax + ins;
    const net = gross - totalDeductions;

    for (const mon of months) {
      const payslipNo = `PAY-${mon.y}${String(mon.m).padStart(2, '0')}-${u.empId}`;
      insertPayroll.run(
        u.id, payslipNo, mon.m, mon.y,
        u.basic, u.hra, allowances, gross,
        tax, pf, ins, pt, totalDeductions,
        net, mon.date, `Salary credited via NEFT/IMPS to ${u.bank}`
      );
    }
  }

  console.log('✅ Seeded 3 months of INR payroll slips for all employees.');

  // Seed Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, link, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(aaravUser.id, 'Welcome to Dayflow!', 'Explore your personal dashboard, attendance clock, leave balances, and salary structure in ₹ INR.', 'system', '/dashboard', 1);
  insertNotif.run(aaravUser.id, 'August 2026 Payslip Ready', 'Your salary slip for August 2026 has been generated and is ready for download in INR (₹).', 'payroll', '/payroll', 0);
  insertNotif.run(aaravUser.id, 'Leave Request Approved', 'Your Paid leave request for July 15 - July 18 was approved by HR.', 'leave', '/leaves', 1);

  insertNotif.run(adminUser.id, 'New Leave Application', 'Aarav Patel applied for 4 days of Paid Leave (Sep 2 - Sep 5).', 'leave', '/admin/leaves', 0);
  insertNotif.run(adminUser.id, 'New Leave Application', 'Ananya Iyer applied for 2 days of Sick Leave (Aug 28 - Aug 29).', 'leave', '/admin/leaves', 0);
  insertNotif.run(adminUser.id, 'Automated Attendance Sync', 'All biometric & web attendance logs synced across Bengaluru, Mumbai, and Hyderabad offices.', 'system', '/admin/attendance', 1);

  // Seed Announcements (Indian Context)
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, content, category, is_pinned, author_name)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAnnouncement.run(
    '🪔 Grand Diwali Celebrations & Annual Bonus Disbursal',
    'Dayflow will celebrate Diwali with a traditional festive lunch, ethnic wear day, and exciting team games on Friday, Oct 30 at all our offices (Bengaluru, Mumbai, Hyderabad, Gurugram, Pune, Chennai). Annual festive bonuses will be credited with October payroll!',
    'Festivals', 1, 'Priya Sharma'
  );

  insertAnnouncement.run(
    '🇮🇳 Independence Day Holiday & Flag Hoisting Ceremony',
    'In commemoration of Independence Day, all Dayflow offices will remain closed on Friday, August 15th. We invite team members and families in Bengaluru HQ for the morning flag hoisting and cultural program.',
    'Holiday', 1, 'People Operations'
  );

  insertAnnouncement.run(
    '⚡ Dayflow Annual Tech Summit & Hackathon 2026',
    'Registrations are open for our 36-hour internal hackathon in Bengaluru! Teams will build cutting-edge generative AI and workforce productivity features. Exciting cash prizes and trophies to be won!',
    'Engineering', 0, 'Aarav Patel'
  );

  insertAnnouncement.run(
    '🏥 Annual Group Health Insurance & Wellness Enrollment',
    'Enrollment for the company-sponsored ₹10 Lakhs floater health insurance (covering employee, spouse, children, and dependent parents) is now open. Upload your dependent KYC documents in your profile.',
    'Benefits', 0, 'Human Resources'
  );

  // Seed Documents (Indian Statutory & Corporate Documents)
  const insertDoc = db.prepare(`
    INSERT INTO documents (user_id, title, doc_type, file_name, file_size, file_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const u of createdUserIds) {
    insertDoc.run(u.id, 'Official Appointment Letter', 'Offer Letter', `${u.empId}_Appointment_Letter.pdf`, '1.4 MB', '/docs/sample_appointment_letter.pdf');
    insertDoc.run(u.id, 'Aadhaar Card (Govt ID Proof)', 'ID Proof', `${u.empId}_Aadhaar_Card.pdf`, '1.1 MB', '/docs/sample_aadhaar.pdf');
    insertDoc.run(u.id, 'Permanent Account Number (PAN Card)', 'Tax Form', `${u.empId}_PAN_Card.pdf`, '850 KB', '/docs/sample_pan.pdf');
    insertDoc.run(u.id, 'Form 16 TDS Certificate (FY 2025-26)', 'Tax Form', `${u.empId}_Form16.pdf`, '1.9 MB', '/docs/sample_form16.pdf');
    insertDoc.run(u.id, 'Highest Educational Degree Certificate', 'Certificate', `${u.empId}_Degree_Certificate.pdf`, '2.2 MB', '/docs/sample_degree.pdf');
  }

  console.log('✅ Dayflow HRMS database seeded successfully with Indian context!');
}

// Execute seed directly if called as a script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
