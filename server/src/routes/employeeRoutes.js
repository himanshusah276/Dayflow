import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  updateProfile,
  createEmployee,
  deleteEmployee,
  uploadAvatar,
  uploadDocument,
  deleteDocument
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';
import { uploadAvatarMiddleware, uploadDocumentMiddleware } from '../services/storageService.js';

const router = express.Router();

// Employees list - both employee (can view directory) and hr_admin (full view)
router.get('/', authenticate, getEmployees);
router.get('/:id', authenticate, getEmployeeById);
router.put('/:id', authenticate, updateProfile);

// File uploads & document management
router.post('/:id/avatar', authenticate, uploadAvatarMiddleware, uploadAvatar);
router.post('/:id/documents', authenticate, uploadDocumentMiddleware, uploadDocument);
router.delete('/:id/documents/:docId', authenticate, deleteDocument);

// Admin-only actions
router.post('/', authenticate, requireHRAdmin, createEmployee);
router.delete('/:id', authenticate, requireHRAdmin, deleteEmployee);

export default router;
