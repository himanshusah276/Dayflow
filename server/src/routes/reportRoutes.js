import express from 'express';
import {
  getDashboardStats,
  getAttendanceExport,
  getPayrollExport
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/dashboard-stats', authenticate, requireHRAdmin, getDashboardStats);
router.get('/attendance-export', authenticate, requireHRAdmin, getAttendanceExport);
router.get('/payroll-export', authenticate, requireHRAdmin, getPayrollExport);

export default router;
