import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  updateProfile,
  createEmployee,
  deleteEmployee,
  uploadDocument
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Employees list - both employee (can view directory) and hr_admin (full view)
router.get('/', authenticate, getEmployees);
router.get('/:id', authenticate, getEmployeeById);
router.put('/:id', authenticate, updateProfile);

// Admin-only actions
router.post('/', authenticate, requireHRAdmin, createEmployee);
router.delete('/:id', authenticate, requireHRAdmin, deleteEmployee);
router.post('/:id/documents', authenticate, uploadDocument);

export default router;
