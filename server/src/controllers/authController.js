import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import { sendVerificationEmail } from '../services/emailService.js';

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
    const { employeeId, email, password, role, firstName, lastName, department, designation } = req.body;

    if (!employeeId || !email || !password) {
      return res.status(400).json({ error: 'Employee ID, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanEmpId = employeeId.trim().toUpperCase();
    const assignedRole = role === 'hr_admin' ? 'hr_admin' : 'employee';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Validate password
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: pwdCheck.message });
    }

    // Check existing email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
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
        INSERT INTO users (employee_id, email, password_hash, role, is_verified, verification_code, verification_code_expires_at)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `);
      const result = insertUser.run(cleanEmpId, cleanEmail, passwordHash, assignedRole, verificationCode, expiresAt);
      userId = result.lastInsertRowid;

      // Create profile
      db.prepare(`
        INSERT INTO employee_profiles (user_id, first_name, last_name, department, designation, date_of_joining)
        VALUES (?, ?, ?, ?, ?, DATE('now'))
      `).run(userId, fName, lName, dept, desig);

      // Create default leave balances
      const currentYear = new Date().getFullYear();
      db.prepare(`
        INSERT INTO leave_balances (user_id, year, paid_leave_total, sick_leave_total, casual_leave_total)
        VALUES (?, ?, 18, 10, 8)
      `).run(userId, currentYear);

      // Create default salary structure
      const defaultBasic = assignedRole === 'hr_admin' ? 5000 : 4200;
      const defaultHra = defaultBasic * 0.4;
      const defaultAllowances = 800;
      const defaultGross = defaultBasic + defaultHra + defaultAllowances;
      const defaultTax = defaultGross * 0.12;
      const defaultPf = defaultBasic * 0.12;
      const defaultInsurance = 150;
      const defaultDeductions = defaultTax + defaultPf + defaultInsurance;
      const defaultNet = defaultGross - defaultDeductions;

      db.prepare(`
        INSERT INTO salary_structures (
          user_id, basic_salary, hra, conveyance_allowance, special_allowance,
          provident_fund, professional_tax, health_insurance,
          gross_salary, total_deductions, net_salary
        ) VALUES (?, ?, ?, 300, 500, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, defaultBasic, defaultHra,
        defaultPf, defaultTax, defaultInsurance,
        defaultGross, defaultDeductions, defaultNet
      );

      // Welcome notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Welcome to Dayflow!', 'Your account has been created. Complete your email verification to get full access.', 'system')
      `).run(userId);
    });

    registerTransaction();

    // Dispatch real email verification
    try {
      await sendVerificationEmail({
        to: cleanEmail,
        name: fName,
        code: verificationCode
      });
    } catch (mailErr) {
      console.warn('Failed to send verification email via transporter, dev code is logged:', mailErr.message);
    }

    return res.status(201).json({
      message: 'Registration successful. A 6-digit verification code has been sent to your email.',
      email: cleanEmail,
      employeeId: cleanEmpId,
      devVerificationCode: verificationCode,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
};

export const verifyEmail = (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.role, u.is_verified, u.verification_code, u.verification_code_expires_at,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ?
    `).get(cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
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
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    // Check expiration
    if (user.verification_code_expires_at && new Date(user.verification_code_expires_at) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Mark verified
    db.prepare(`
      UPDATE users
      SET is_verified = 1, verification_code = NULL, verification_code_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare(`
      SELECT u.id, u.is_verified, p.first_name
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ?
    `).get(cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
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

    try {
      await sendVerificationEmail({
        to: cleanEmail,
        name: user.first_name,
        code: newCode
      });
    } catch (mailErr) {
      console.warn('Failed to send resend email via transporter:', mailErr.message);
    }

    return res.json({
      message: 'A new 6-digit verification code has been sent.',
      devVerificationCode: newCode,
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return res.status(500).json({ error: 'Failed to resend code.' });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.password_hash, u.role, u.is_verified,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation, p.status
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ?
    `).get(cleanEmail);

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email address. Please check your spelling or sign up.'
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
        error: 'Please verify your email before signing in.',
        needsVerification: true,
        email: user.email
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
        role: user.role,
        isVerified: true,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        department: user.department,
        designation: user.designation,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
};

// 1-Click Quick Demo Login helper (allows instantaneous testing without typing)
export const quickLogin = (req, res) => {
  try {
    const { role } = req.query; // 'admin' or 'employee'
    const targetEmail = role === 'admin' ? 'admin@dayflow.com' : 'alex@dayflow.com';

    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.role, u.is_verified,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation, p.status
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.email = ?
    `).get(targetEmail);

    if (!user) {
      return res.status(404).json({ error: 'Demo account not found. Please run seed script.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: `Quick logged in as ${user.first_name} (${user.role === 'hr_admin' ? 'HR Admin' : 'Employee'})`,
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role: user.role,
        isVerified: true,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        department: user.department,
        designation: user.designation,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Quick login error:', error);
    return res.status(500).json({ error: 'Quick login failed.' });
  }
};

export const getMe = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.role, u.is_verified, u.created_at,
             p.first_name, p.last_name, p.avatar_url, p.phone, p.address, p.city, p.state, p.country, p.zip_code,
             p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relation,
             p.date_of_birth, p.gender, p.department, p.designation, p.date_of_joining,
             p.employment_type, p.status, p.reporting_manager, p.work_location, p.bio
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get unread notification count
    const unreadNotif = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);

    return res.json({
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role: user.role,
        isVerified: !!user.is_verified,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zip_code,
        emergencyContactName: user.emergency_contact_name,
        emergencyContactPhone: user.emergency_contact_phone,
        emergencyContactRelation: user.emergency_contact_relation,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        department: user.department,
        designation: user.designation,
        dateOfJoining: user.date_of_joining,
        employmentType: user.employment_type,
        status: user.status,
        reportingManager: user.reporting_manager,
        workLocation: user.work_location,
        bio: user.bio,
        createdAt: user.created_at
      },
      unreadNotificationsCount: unreadNotif ? unreadNotif.count : 0
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch current user profile' });
  }
};
