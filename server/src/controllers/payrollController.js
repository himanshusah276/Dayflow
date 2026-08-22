import db from '../config/db.js';

export const getMySalaryStructure = (req, res) => {
  try {
    const userId = req.user.id;
    const structure = db.prepare('SELECT * FROM salary_structures WHERE user_id = ?').get(userId);

    if (!structure) {
      return res.status(404).json({ error: 'Salary structure not defined for this employee.' });
    }

    return res.json({ structure });
  } catch (error) {
    console.error('getMySalaryStructure error:', error);
    return res.status(500).json({ error: 'Failed to fetch salary structure.' });
  }
};

export const getMyPayslips = (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    let query = `
      SELECT p.*,
             u.employee_id,
             ep.first_name, ep.last_name, ep.department, ep.designation, ep.date_of_joining
      FROM payroll_records p
      JOIN users u ON p.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (year) {
      query += ` AND p.year = ?`;
      params.push(year);
    }

    query += ` ORDER BY p.year DESC, p.month DESC`;

    const payslips = db.prepare(query).all(...params);

    return res.json({ payslips });
  } catch (error) {
    console.error('getMyPayslips error:', error);
    return res.status(500).json({ error: 'Failed to fetch payslips.' });
  }
};

export const getAllSalaryStructures = (req, res) => {
  try {
    const { department, search } = req.query;

    let query = `
      SELECT s.*,
             u.employee_id, u.email,
             p.first_name, p.last_name, p.avatar_url, p.department, p.designation, p.status, p.employment_type
      FROM salary_structures s
      JOIN users u ON s.user_id = u.id
      JOIN employee_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'All') {
      query += ` AND p.department = ?`;
      params.push(department);
    }

    if (search) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR u.employee_id LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY p.first_name ASC`;

    const structures = db.prepare(query).all(...params);

    return res.json({ structures });
  } catch (error) {
    console.error('getAllSalaryStructures error:', error);
    return res.status(500).json({ error: 'Failed to fetch salary structures.' });
  }
};

export const updateSalaryStructure = (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);
    const {
      basicSalary,
      hra,
      conveyanceAllowance,
      specialAllowance,
      medicalAllowance,
      providentFund,
      professionalTax,
      healthInsurance,
      paymentMethod,
      bankName,
      accountNumber,
      currency
    } = req.body;

    const basic = parseFloat(basicSalary) || 0;
    const hraVal = parseFloat(hra) || 0;
    const conv = parseFloat(conveyanceAllowance) || 0;
    const spec = parseFloat(specialAllowance) || 0;
    const med = parseFloat(medicalAllowance) || 0;

    const gross = basic + hraVal + conv + spec + med;

    const pf = parseFloat(providentFund) || 0;
    const tax = parseFloat(professionalTax) || 0;
    const ins = parseFloat(healthInsurance) || 0;

    const deductions = pf + tax + ins;
    const net = gross - deductions;

    const existing = db.prepare('SELECT id FROM salary_structures WHERE user_id = ?').get(targetUserId);

    if (existing) {
      db.prepare(`
        UPDATE salary_structures SET
          currency = COALESCE(?, currency),
          basic_salary = ?,
          hra = ?,
          conveyance_allowance = ?,
          special_allowance = ?,
          medical_allowance = ?,
          provident_fund = ?,
          professional_tax = ?,
          health_insurance = ?,
          gross_salary = ?,
          total_deductions = ?,
          net_salary = ?,
          payment_method = COALESCE(?, payment_method),
          bank_name = COALESCE(?, bank_name),
          account_number = COALESCE(?, account_number),
          effective_date = DATE('now'),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        currency || 'USD', basic, hraVal, conv, spec, med,
        pf, tax, ins, gross, deductions, net,
        paymentMethod, bankName, accountNumber,
        targetUserId
      );
    } else {
      db.prepare(`
        INSERT INTO salary_structures (
          user_id, currency, basic_salary, hra, conveyance_allowance, special_allowance,
          medical_allowance, provident_fund, professional_tax, health_insurance,
          gross_salary, total_deductions, net_salary, payment_method, bank_name, account_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        targetUserId, currency || 'USD', basic, hraVal, conv, spec, med,
        pf, tax, ins, gross, deductions, net,
        paymentMethod || 'Direct Deposit', bankName, accountNumber
      );
    }

    // In-app notification to employee
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, 'Salary Structure Updated', 'Your salary compensation structure has been revised by HR.', 'payroll', '/payroll')
    `).run(targetUserId);

    const updated = db.prepare('SELECT * FROM salary_structures WHERE user_id = ?').get(targetUserId);

    return res.json({
      message: 'Salary structure updated successfully.',
      structure: updated
    });
  } catch (error) {
    console.error('updateSalaryStructure error:', error);
    return res.status(500).json({ error: 'Failed to update salary structure.' });
  }
};

export const getAllPayslips = (req, res) => {
  try {
    const { month, year, department, search, status } = req.query;

    let query = `
      SELECT p.*,
             u.employee_id, u.email,
             ep.first_name, ep.last_name, ep.avatar_url, ep.department, ep.designation
      FROM payroll_records p
      JOIN users u ON p.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE 1=1
    `;
    const params = [];

    if (month && month !== 'All') {
      query += ` AND p.month = ?`;
      params.push(parseInt(month, 10));
    }

    if (year && year !== 'All') {
      query += ` AND p.year = ?`;
      params.push(parseInt(year, 10));
    }

    if (status && status !== 'All') {
      query += ` AND p.payment_status = ?`;
      params.push(status);
    }

    if (department && department !== 'All') {
      query += ` AND ep.department = ?`;
      params.push(department);
    }

    if (search) {
      query += ` AND (ep.first_name LIKE ? OR ep.last_name LIKE ? OR u.employee_id LIKE ? OR p.payslip_number LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY p.year DESC, p.month DESC, ep.first_name ASC`;

    const payslips = db.prepare(query).all(...params);

    return res.json({ payslips });
  } catch (error) {
    console.error('getAllPayslips error:', error);
    return res.status(500).json({ error: 'Failed to fetch payslips.' });
  }
};

export const generateMonthlyPayroll = (req, res) => {
  try {
    const { month, year, paymentDate, notes } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required.' });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const payDate = paymentDate || new Date().toISOString().split('T')[0];

    // Fetch all active employees with defined salary structures
    const employees = db.prepare(`
      SELECT u.id as user_id, u.employee_id, p.first_name, p.last_name,
             s.basic_salary, s.hra, s.conveyance_allowance, s.special_allowance, s.medical_allowance,
             s.provident_fund, s.professional_tax, s.health_insurance,
             s.gross_salary, s.total_deductions, s.net_salary
      FROM users u
      JOIN employee_profiles p ON u.id = p.user_id
      JOIN salary_structures s ON u.id = s.user_id
      WHERE p.status != 'Terminated'
    `).all();

    let generatedCount = 0;
    let skippedCount = 0;

    const generateTransaction = db.transaction(() => {
      for (const emp of employees) {
        // Check if payslip already exists
        const existing = db.prepare('SELECT id FROM payroll_records WHERE user_id = ? AND month = ? AND year = ?').get(emp.user_id, m, y);
        if (existing) {
          skippedCount++;
          continue;
        }

        const payslipNum = `PAY-${y}${String(m).padStart(2, '0')}-${emp.employee_id}`;
        const allowances = (emp.conveyance_allowance || 0) + (emp.special_allowance || 0) + (emp.medical_allowance || 0);

        db.prepare(`
          INSERT INTO payroll_records (
            user_id, payslip_number, month, year,
            basic_pay, hra, allowances, gross_pay,
            tax_deduction, pf_deduction, insurance_deduction, total_deductions,
            net_pay, payment_status, payment_date, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?)
        `).run(
          emp.user_id, payslipNum, m, y,
          emp.basic_salary, emp.hra, allowances, emp.gross_salary,
          emp.professional_tax, emp.provident_fund, emp.health_insurance, emp.total_deductions,
          emp.net_salary, payDate, notes || `Processed regular monthly payroll for ${m}/${y}`
        );

        // Notify employee
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[m - 1] || `${m}`;

        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, 'Salary Slip Available', ? || ' ' || ? || ' payslip has been generated and is ready for download.', 'payroll', '/payroll')
        `).run(emp.user_id, monthName, y);

        generatedCount++;
      }
    });

    generateTransaction();

    return res.json({
      message: `Payroll generation complete. ${generatedCount} payslips created (${skippedCount} already existed).`,
      generatedCount,
      skippedCount
    });
  } catch (error) {
    console.error('generateMonthlyPayroll error:', error);
    return res.status(500).json({ error: 'Failed to generate monthly payroll.' });
  }
};

export const getPayslipById = (req, res) => {
  try {
    const payslipId = parseInt(req.params.id, 10);

    const payslip = db.prepare(`
      SELECT p.*,
             u.employee_id, u.email,
             ep.first_name, ep.last_name, ep.phone, ep.address, ep.city, ep.state,
             ep.department, ep.designation, ep.date_of_joining, ep.employment_type,
             s.bank_name, s.account_number, s.payment_method, s.currency
      FROM payroll_records p
      JOIN users u ON p.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN salary_structures s ON u.id = s.user_id
      WHERE p.id = ?
    `).get(payslipId);

    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found.' });
    }

    // Role check: non-admin can only view their own payslip
    if (req.user.role !== 'hr_admin' && req.user.id !== payslip.user_id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own payslips.' });
    }

    return res.json({ payslip });
  } catch (error) {
    console.error('getPayslipById error:', error);
    return res.status(500).json({ error: 'Failed to fetch payslip.' });
  }
};
