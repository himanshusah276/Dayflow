import express from 'express';
import {
  getMySalaryStructure,
  getMyPayslips,
  getAllSalaryStructures,
  updateSalaryStructure,
  getAllPayslips,
  generateMonthlyPayroll,
  getPayslipById
} from '../controllers/payrollController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Employee & Common
router.get('/my-structure', authenticate, getMySalaryStructure);
router.get('/my-slips', authenticate, getMyPayslips);
router.get('/slip/:id', authenticate, getPayslipById);

// HR Admin
router.get('/structures', authenticate, requireHRAdmin, getAllSalaryStructures);
router.put('/structures/:userId', authenticate, requireHRAdmin, updateSalaryStructure);
router.get('/all-slips', authenticate, requireHRAdmin, getAllPayslips);
router.post('/generate', authenticate, requireHRAdmin, generateMonthlyPayroll);

export default router;
