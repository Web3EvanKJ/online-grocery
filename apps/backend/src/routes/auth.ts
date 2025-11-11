// src/routes/auth.ts
import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  resendVerification,
  refreshToken,
} from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { auth } from '../middleware/auth.js';
import { authLimiter, verificationLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, validate('register'), register);
router.post('/verify', authLimiter, validate('verifyEmail'), verifyEmail);
router.post('/login', authLimiter, validate('login'), login);
router.post('/logout', auth, logout);
router.post('/forgot-password', authLimiter, validate('forgotPassword'), forgotPassword);
router.post('/reset-password', authLimiter, validate('resetPassword'), resetPassword);
router.post('/resend-verification', verificationLimiter, validate('resendVerification'), resendVerification);
router.post('/refresh-token', refreshToken);

export default router;