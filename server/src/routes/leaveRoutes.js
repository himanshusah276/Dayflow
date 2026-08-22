import express from 'express';
import {
  getLeaveBalances,
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  reviewLeaveRequest
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/balances', authenticate, getLeaveBalances);
router.post('/apply', authenticate, applyLeave);
router.get('/my-requests', authenticate, getMyLeaveRequests);

// HR Admin routes
router.get('/all-requests', authenticate, requireHRAdmin, getAllLeaveRequests);
router.put('/:id/review', authenticate, requireHRAdmin, reviewLeaveRequest);

export default router;
