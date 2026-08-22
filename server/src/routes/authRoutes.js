import express from 'express';
import { register, login, verifyEmail, resendVerificationCode, quickLogin, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/verify-email', authRateLimiter, verifyEmail);
router.post('/resend-code', authRateLimiter, resendVerificationCode);
router.get('/quick-login', quickLogin);
router.get('/me', authenticate, getMe);

export default router;
