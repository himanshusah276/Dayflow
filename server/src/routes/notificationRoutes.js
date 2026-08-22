import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getAnnouncements,
  createAnnouncement
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireHRAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.post('/read-all', authenticate, markAllAsRead);

// Announcements
router.get('/announcements', authenticate, getAnnouncements);
router.post('/announcements', authenticate, requireHRAdmin, createAnnouncement);

export default router;
