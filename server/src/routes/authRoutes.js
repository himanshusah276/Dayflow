import express from 'express';
import { register, login, verifyEmail, resendVerificationCode, quickLogin, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);
router.get('/quick-login', quickLogin);
router.get('/me', authenticate, getMe);

export default router;
