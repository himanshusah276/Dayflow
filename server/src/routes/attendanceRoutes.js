import express from 'express';
import {
  getTodayStatus,
  checkIn,
  checkOut,
  getMyAttendanceHistory,
  getCompanyAttendance,
  regularizeAttendance
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Employee & Common routes
router.get('/today', authenticate, getTodayStatus);
router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.get('/my-history', authenticate, getMyAttendanceHistory);

// Admin-only routes
router.get('/company-history', authenticate, requireHRAdmin, getCompanyAttendance);
router.post('/regularize', authenticate, requireHRAdmin, regularizeAttendance);

export default router;
