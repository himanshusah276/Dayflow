import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { sendOtpSms, normalizePhoneNumber } from '../services/smsService.js';

// Password complexity: at least 8 chars, containing at least 1 letter and 1 number
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a mix of letters and numbers.' };
  }
  return { valid: true };
}

// Generate random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const register = async (req, res) => {
  try {
    const { employeeId, email, phone, password, role, firstName, lastName, department, designation } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ error: 'Employee ID and password are required.' });
    }

    // Require at least phone number OR email
    if (!phone && !email) {
      return res.status(400).json({ error: 'Please provide either a mobile phone number or an email address.' });
    }

    const cleanEmpId = employeeId.trim().toUpperCase();
    const assignedRole = role === 'hr_admin' ? 'hr_admin' : 'employee';
    const cleanPhone = phone ? normalizePhoneNumber(phone.trim()) : null;
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : `${cleanEmpId.toLowerCase()}@dayflow.in`;

    // Validate email format if explicitly supplied
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
    }

    // Validate password
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.message });
    }

    // Check existing email if provided
    if (email && email.trim()) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }
    }

    // Check existing phone if provided
    if (cleanPhone) {
      const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(cleanPhone);
      if (existingPhone) {
        return res.status(409).json({ error: 'An account with this mobile phone number already exists.' });
      }
    }

    // Check existing employee ID
    const existingEmpId = db.prepare('SELECT id FROM users WHERE employee_id = ?').get(cleanEmpId);
    if (existingEmpId) {
      return res.status(409).json({ error: 'This Employee ID is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    // Insert user inside transaction
    const fName = firstName || (assignedRole === 'hr_admin' ? 'HR' : 'Employee');
    const lName = lastName || cleanEmpId;
    const dept = department || (assignedRole === 'hr_admin' ? 'Human Resources' : 'Engineering');
    const desig = designation || (assignedRole === 'hr_admin' ? 'HR Specialist' : 'Associate Member');

    let userId;
    const registerTransaction = db.transaction(() => {
      const insertUser = db.prepare(`
        INSERT INTO users (employee_id, email, phone, password_hash, role, is_verified, verification_code, verification_code_expires_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `);
      const result = insertUser.run(cleanEmpId, cleanEmail, cleanPhone, passwordHash, assignedRole, verificationCode, expiresAt);
      userId = result.lastInsertRowid;

      // Create profile
      db.prepare(`
        INSERT INTO employee_profiles (user_id, first_name, last_name, phone, department, designation, date_of_joining, country, work_location)
        VALUES (?, ?, ?, ?, ?, ?, DATE('now'), 'India', 'HQ — Electronic City, Bengaluru')
      `).run(userId, fName, lName, cleanPhone, dept, desig);

      // Create default leave balances
      const currentYear = new Date().getFullYear();
      db.prepare(`
        INSERT INTO leave_balances (user_id, year, paid_leave_total, sick_leave_total, casual_leave_total)
        VALUES (?, ?, 18, 10, 8)
      `).run(userId, currentYear);

      // Create default salary structure (INR)
      const defaultBasic = assignedRole === 'hr_admin' ? 95000 : 75000;
      const defaultHra = Math.round(defaultBasic * 0.4);
      const defaultConveyance = 2000;
      const defaultSpecial = 15000;
      const defaultMedical = 1800;
      const defaultGross = defaultBasic + defaultHra + defaultConveyance + defaultSpecial + defaultMedical;
      const defaultPf = Math.round(defaultBasic * 0.12);
      const defaultPt = 200;
      const defaultTax = Math.round(defaultGross * 0.10);
      const defaultInsurance = 750;
      const defaultDeductions = defaultPf + defaultPt + defaultTax + defaultInsurance;
      const defaultNet = defaultGross - defaultDeductions;

      db.prepare(`
        INSERT INTO salary_structures (
          user_id, currency, basic_salary, hra, conveyance_allowance, special_allowance,
          medical_allowance, provident_fund, professional_tax, health_insurance,
          gross_salary, total_deductions, net_salary, payment_method
        ) VALUES (?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEFT / Direct Bank Transfer')
      `).run(
        userId, defaultBasic, defaultHra, defaultConveyance, defaultSpecial, defaultMedical,
        defaultPf, defaultPt, defaultInsurance,
        defaultGross, defaultDeductions, defaultNet
      );

      // Welcome notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Welcome to Dayflow!', 'Your account has been created. Complete your OTP verification to get full access to your Indian HRMS portal.', 'system')
      `).run(userId);
    });

    registerTransaction();

    // Dispatch SMS OTP if phone provided
    if (cleanPhone) {
      try {
        await sendOtpSms({
          phone: cleanPhone,
          name: fName,
          code: verificationCode
        });
      } catch (smsErr) {
        console.warn('Failed to send SMS OTP:', smsErr.message);
      }
    }

    // Dispatch real email verification if email provided
    if (email && email.trim()) {
      try {
        await sendVerificationEmail({
          to: cleanEmail,
          name: fName,
          code: verificationCode
        });
      } catch (mailErr) {
        console.warn('Failed to send verification email via transporter:', mailErr.message);
      }
    }

    return res.status(201).json({
      message: 'Registration successful. A 6-digit OTP verification code has been dispatched.',
      phone: cleanPhone,
      email: cleanEmail,
      employeeId: cleanEmpId
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
};

export const verifyEmail = (req, res) => {
  try {
    const { identifier, email, phone, code } = req.body;
    const lookupKey = (identifier || email || phone || '').trim();

    if (!lookupKey || !code) {
      return res.status(400).json({ error: 'Mobile number or email and verification code are required.' });
    }

    const cleanCode = code.toString().trim();
    const normPhone = normalizePhoneNumber(lookupKey);

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.phone, u.role, u.is_verified, u.verification_code, u.verification_code_expires_at,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ? OR u.phone = ? OR u.phone = ? OR u.employee_id = ?
    `).get(lookupKey.toLowerCase(), lookupKey, normPhone, lookupKey.toUpperCase());

    if (!user) {
      return res.status(404).json({ error: 'No account found matching this mobile number or email.' });
    }

    if (user.is_verified === 1) {
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        message: 'Account is already verified.',
        token,
        user: {
          id: user.id,
          employeeId: user.employee_id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: true,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          department: user.department,
          designation: user.designation
        }
      });
    }

    if (user.verification_code !== cleanCode) {
      return res.status(400).json({ error: 'Invalid verification OTP. Please check and try again.' });
    }

    // Check expiration
    if (user.verification_code_expires_at && new Date(user.verification_code_expires_at) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
    }

    // Mark verified
    db.prepare(`
      UPDATE users
      SET is_verified = 1, verification_code = NULL, verification_code_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: 'Account verified successfully!',
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: true,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        department: user.department,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { identifier, email, phone } = req.body;
    const lookupKey = (identifier || email || phone || '').trim();

    if (!lookupKey) {
      return res.status(400).json({ error: 'Mobile number or email is required.' });
    }

    const normPhone = normalizePhoneNumber(lookupKey);

    const user = db.prepare(`
      SELECT u.id, u.email, u.phone, u.employee_id, u.is_verified, p.first_name
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ? OR u.phone = ? OR u.phone = ? OR u.employee_id = ?
    `).get(lookupKey.toLowerCase(), lookupKey, normPhone, lookupKey.toUpperCase());

    if (!user) {
      return res.status(404).json({ error: 'No account found matching this mobile number or email.' });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({ error: 'Account is already verified. You can log in directly.' });
    }

    const newCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE users
      SET verification_code = ?, verification_code_expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newCode, expiresAt, user.id);

    // Send SMS if phone exists
    if (user.phone) {
      try {
        await sendOtpSms({
          phone: user.phone,
          name: user.first_name,
          code: newCode
        });
      } catch (smsErr) {
        console.warn('Failed to resend SMS OTP:', smsErr.message);
      }
    }

    // Send Email if real email exists
    if (user.email && !user.email.endsWith('@dayflow.in')) {
      try {
        await sendVerificationEmail({
          to: user.email,
          name: user.first_name,
          code: newCode
        });
      } catch (mailErr) {
        console.warn('Failed to resend verification email:', mailErr.message);
      }
    }

    return res.json({
      message: 'A new 6-digit verification code has been dispatched to your mobile / email.'
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return res.status(500).json({ error: 'Failed to resend OTP code.' });
  }
};

export const login = (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const lookupKey = (identifier || email || phone || '').trim();

    if (!lookupKey || !password) {
      return res.status(400).json({ error: 'Please provide your mobile number / email and password.' });
    }

    const normPhone = normalizePhoneNumber(lookupKey);

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.phone, u.password_hash, u.role, u.is_verified,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation, p.status
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ? OR u.phone = ? OR u.phone = ? OR u.employee_id = ?
    `).get(lookupKey.toLowerCase(), lookupKey, normPhone, lookupKey.toUpperCase());

    if (!user) {
      return res.status(401).json({
        error: 'No account found with these details. Please check your credentials or register.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    if (user.is_verified === 0) {
      return res.status(403).json({
        error: 'Please verify your phone number or email before signing in.',
        needsVerification: true,
        identifier: user.phone || user.email,
        email: user.email,
        phone: user.phone
      });
    }

    if (user.status === 'Terminated') {
      return res.status(403).json({
        error: 'This account has been deactivated. Please contact HR.'
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: true,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        department: user.department,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal login error. Please try again.' });
  }
};

export const quickLogin = (req, res) => {
  try {
    const role = req.query.role || 'employee';
    const targetEmail = role === 'admin' || role === 'hr_admin' ? 'admin@dayflow.com' : 'alex@dayflow.com';

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.phone, u.role, u.is_verified,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ?
    `).get(targetEmail);

    if (!user) {
      return res.status(404).json({ error: 'Demo user account not found.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: `Quick login as ${user.role} successful.`,
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: true,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        department: user.department,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Quick login error:', error);
    return res.status(500).json({ error: 'Quick login failed.' });
  }
};

export const getMe = (req, res) => {
  try {
    const userId = req.user.id;

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.phone, u.role, u.is_verified, u.created_at,
             p.first_name, p.last_name, p.avatar_url, p.phone as profile_phone, p.address,
             p.city, p.state, p.country, p.zip_code, p.department, p.designation,
             p.date_of_joining, p.employment_type, p.status, p.reporting_manager,
             p.work_location, p.bio
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(userId);

    return res.json({
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        phone: user.phone || user.profile_phone,
        role: user.role,
        isVerified: user.is_verified === 1,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        department: user.department,
        designation: user.designation,
        dateOfJoining: user.date_of_joining,
        employmentType: user.employment_type,
        status: user.status,
        reportingManager: user.reporting_manager,
        workLocation: user.work_location,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zip_code,
        bio: user.bio,
        createdAt: user.created_at
      },
      unreadNotificationsCount: unreadCount ? unreadCount.count : 0
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};
