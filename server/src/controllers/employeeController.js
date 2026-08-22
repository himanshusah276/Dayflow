import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { storageProvider } from '../services/storageService.js';

export const getEmployees = (req, res) => {
  try {
    const { search, department, status } = req.query;

    let query = `
      SELECT u.id, u.employee_id, u.email, u.role, u.is_verified, u.created_at,
             p.first_name, p.last_name, p.avatar_url, p.phone, p.department,
             p.designation, p.date_of_joining, p.employment_type, p.status,
             p.reporting_manager, p.work_location,
             s.gross_salary, s.net_salary, s.currency
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      LEFT JOIN salary_structures s ON u.id = s.user_id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        u.email LIKE ? OR 
        u.employee_id LIKE ? OR 
        p.designation LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (department && department !== 'All') {
      query += ` AND p.department = ?`;
      params.push(department);
    }

    if (status && status !== 'All') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY p.first_name ASC, p.last_name ASC`;

    const employees = db.prepare(query).all(...params);

    return res.json({ employees });
  } catch (error) {
    console.error('getEmployees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    // If employee, they can only view their own profile unless hr_admin
    if (req.user.role !== 'hr_admin' && req.user.id !== targetUserId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
    }

    const employee = db.prepare(`
      SELECT u.id, u.employee_id, u.email, u.role, u.is_verified, u.created_at,
             p.first_name, p.last_name, p.avatar_url, p.phone, p.address, p.city, p.state, p.country, p.zip_code,
             p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relation,
             p.date_of_birth, p.gender, p.department, p.designation, p.date_of_joining,
             p.employment_type, p.status, p.reporting_manager, p.work_location, p.bio
      FROM users u
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(targetUserId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch salary structure
    const salary = db.prepare(`
      SELECT * FROM salary_structures WHERE user_id = ?
    `).get(targetUserId);

    // Fetch leave balances for current year
    const currentYear = new Date().getFullYear();
    const leaveBalance = db.prepare(`
      SELECT * FROM leave_balances WHERE user_id = ? AND year = ?
    `).get(targetUserId, currentYear);

    // Fetch documents
    const documents = db.prepare(`
      SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC
    `).all(targetUserId);

    return res.json({
      employee: {
        id: employee.id,
        employeeId: employee.employee_id,
        email: employee.email,
        role: employee.role,
        isVerified: !!employee.is_verified,
        firstName: employee.first_name,
        lastName: employee.last_name,
        avatarUrl: employee.avatar_url,
        phone: employee.phone,
        address: employee.address,
        city: employee.city,
        state: employee.state,
        country: employee.country,
        zipCode: employee.zip_code,
        emergencyContactName: employee.emergency_contact_name,
        emergencyContactPhone: employee.emergency_contact_phone,
        emergencyContactRelation: employee.emergency_contact_relation,
        dateOfBirth: employee.date_of_birth,
        gender: employee.gender,
        department: employee.department,
        designation: employee.designation,
        dateOfJoining: employee.date_of_joining,
        employmentType: employee.employment_type,
        status: employee.status,
        reportingManager: employee.reporting_manager,
        workLocation: employee.work_location,
        bio: employee.bio,
        createdAt: employee.created_at
      },
      salary: salary || null,
      leaveBalance: leaveBalance || null,
      documents
    });
  } catch (error) {
    console.error('getEmployeeById error:', error);
    return res.status(500).json({ error: 'Failed to fetch employee details' });
  }
};

export const updateProfile = (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const isHrAdmin = req.user.role === 'hr_admin';

    // Role check: non-admin can only edit their own profile
    if (!isHrAdmin && req.user.id !== targetUserId) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own profile.' });
    }

    const {
      // Self-service fields (allowed for both employee & admin)
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      avatarUrl,
      bio,

      // Admin-only fields
      firstName,
      lastName,
      department,
      designation,
      dateOfJoining,
      dateOfBirth,
      gender,
      employmentType,
      status,
      reportingManager,
      workLocation,
      role
    } = req.body;

    const existing = db.prepare('SELECT * FROM employee_profiles WHERE user_id = ?').get(targetUserId);
    if (!existing) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    if (isHrAdmin) {
      // HR Admin can update everything
      db.prepare(`
        UPDATE employee_profiles SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          avatar_url = COALESCE(?, avatar_url),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          country = COALESCE(?, country),
          zip_code = COALESCE(?, zip_code),
          emergency_contact_name = COALESCE(?, emergency_contact_name),
          emergency_contact_phone = COALESCE(?, emergency_contact_phone),
          emergency_contact_relation = COALESCE(?, emergency_contact_relation),
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender),
          department = COALESCE(?, department),
          designation = COALESCE(?, designation),
          date_of_joining = COALESCE(?, date_of_joining),
          employment_type = COALESCE(?, employment_type),
          status = COALESCE(?, status),
          reporting_manager = COALESCE(?, reporting_manager),
          work_location = COALESCE(?, work_location),
          bio = COALESCE(?, bio),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        firstName, lastName, avatarUrl, phone, address, city, state, country, zipCode,
        emergencyContactName, emergencyContactPhone, emergencyContactRelation,
        dateOfBirth, gender, department, designation, dateOfJoining,
        employmentType, status, reportingManager, workLocation, bio,
        targetUserId
      );

      // If admin changed role
      if (role && (role === 'employee' || role === 'hr_admin')) {
        db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, targetUserId);
      }
    } else {
      // Employee self-service: only allow updating personal contact, avatar, bio, emergency contact
      db.prepare(`
        UPDATE employee_profiles SET
          avatar_url = COALESCE(?, avatar_url),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          country = COALESCE(?, country),
          zip_code = COALESCE(?, zip_code),
          emergency_contact_name = COALESCE(?, emergency_contact_name),
          emergency_contact_phone = COALESCE(?, emergency_contact_phone),
          emergency_contact_relation = COALESCE(?, emergency_contact_relation),
          bio = COALESCE(?, bio),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        avatarUrl, phone, address, city, state, country, zipCode,
        emergencyContactName, emergencyContactPhone, emergencyContactRelation,
        bio, targetUserId
      );
    }

    return res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const createEmployee = (req, res) => {
  try {
    const {
      employeeId, email, password, role,
      firstName, lastName, phone, department, designation,
      dateOfJoining, employmentType, basicSalary, workLocation, reportingManager
    } = req.body;

    if (!employeeId || !email || !firstName || !lastName || !department || !designation) {
      return res.status(400).json({ error: 'Missing required employee details.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanEmpId = employeeId.trim().toUpperCase();

    // Check duplicates
    const existEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existEmail) return res.status(409).json({ error: 'An account with this email already exists.' });

    const existId = db.prepare('SELECT id FROM users WHERE employee_id = ?').get(cleanEmpId);
    if (existId) return res.status(409).json({ error: 'This Employee ID is already in use.' });

    const defaultPwd = password || 'Welcome@123';
    const pwdHash = bcrypt.hashSync(defaultPwd, 10);
    const assignedRole = role === 'hr_admin' ? 'hr_admin' : 'employee';

    // Insert user (pre-verified when created by HR Admin)
    let userId;
    const createTransaction = db.transaction(() => {
      const userRes = db.prepare(`
        INSERT INTO users (employee_id, email, password_hash, role, is_verified)
        VALUES (?, ?, ?, ?, 1)
      `).run(cleanEmpId, cleanEmail, pwdHash, assignedRole);

      userId = userRes.lastInsertRowid;

      // Insert profile
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmpId}`;
      db.prepare(`
        INSERT INTO employee_profiles (
          user_id, first_name, last_name, avatar_url, phone,
          department, designation, date_of_joining, employment_type,
          status, reporting_manager, work_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)
      `).run(
        userId, firstName, lastName, avatar, phone || '',
        department, designation, dateOfJoining || new Date().toISOString().split('T')[0],
        employmentType || 'Full-Time', reportingManager || 'HR Manager', workLocation || 'Headquarters (San Francisco)'
      );

      // Insert leave balance
      const currentYear = new Date().getFullYear();
      db.prepare(`
        INSERT INTO leave_balances (user_id, year, paid_leave_total, sick_leave_total, casual_leave_total)
        VALUES (?, ?, 18, 10, 8)
      `).run(userId, currentYear);

      // Insert salary structure
      const basic = parseFloat(basicSalary) || 4500;
      const hra = basic * 0.4;
      const conveyance = 300;
      const special = 500;
      const gross = basic + hra + conveyance + special;
      const pf = basic * 0.12;
      const tax = gross * 0.12;
      const ins = 150;
      const deductions = pf + tax + ins;
      const net = gross - deductions;

      db.prepare(`
        INSERT INTO salary_structures (
          user_id, basic_salary, hra, conveyance_allowance, special_allowance,
          provident_fund, professional_tax, health_insurance,
          gross_salary, total_deductions, net_salary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, basic, hra, conveyance, special, pf, tax, ins, gross, deductions, net);

      // Welcome notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Welcome to Dayflow!', 'Your profile has been created by HR. You can now track attendance, view payroll, and apply for leaves.', 'system')
      `).run(userId);
    });

    createTransaction();

    return res.status(201).json({
      message: 'Employee created successfully.',
      employee: {
        id: userId,
        employeeId: cleanEmpId,
        email: cleanEmail,
        firstName,
        lastName,
        department,
        designation
      }
    });
  } catch (error) {
    console.error('createEmployee error:', error);
    return res.status(500).json({ error: 'Failed to create employee.' });
  }
};

export const deleteEmployee = (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (req.user.id === targetUserId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);

    return res.json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('deleteEmployee error:', error);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const isHrAdmin = req.user.role === 'hr_admin';

    if (!isHrAdmin && req.user.id !== targetUserId) {
      return res.status(403).json({ error: 'Access denied. You can only update your own avatar.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const saved = await storageProvider.saveFile({
      subfolder: 'avatars',
      originalname: req.file.originalname,
      buffer: req.file.buffer
    });

    db.prepare('UPDATE employee_profiles SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
      .run(saved.url, targetUserId);

    return res.json({
      message: 'Avatar uploaded and updated successfully.',
      avatarUrl: saved.url
    });
  } catch (error) {
    console.error('uploadAvatar error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload avatar.' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const isHrAdmin = req.user.role === 'hr_admin';

    if (!isHrAdmin && req.user.id !== targetUserId) {
      return res.status(403).json({ error: 'Access denied. You can only upload documents for yourself.' });
    }

    let fileUrl = '/docs/document.pdf';
    let fileName = 'document.pdf';
    let fileSize = '1.2 MB';

    if (req.file) {
      const saved = await storageProvider.saveFile({
        subfolder: 'documents',
        originalname: req.file.originalname,
        buffer: req.file.buffer
      });
      fileUrl = saved.url;
      fileName = req.file.originalname;
      fileSize = `${(saved.size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (req.body.fileName) {
      fileName = req.body.fileName;
      fileSize = req.body.fileSize || '1.4 MB';
      fileUrl = `/docs/${fileName}`;
    }

    const { title, docType } = req.body;

    if (!title || !docType) {
      return res.status(400).json({ error: 'Document title and type are required.' });
    }

    const result = db.prepare(`
      INSERT INTO documents (user_id, title, doc_type, file_name, file_size, file_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(targetUserId, title, docType, fileName, fileSize, fileUrl);

    return res.status(201).json({
      message: 'Document uploaded successfully.',
      documentId: result.lastInsertRowid,
      fileUrl
    });
  } catch (error) {
    console.error('uploadDocument error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload document.' });
  }
};
