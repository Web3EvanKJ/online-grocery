import { Router, RequestHandler } from 'express';
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

const router = Router();

router.post('/register', register as RequestHandler);
router.post('/verify-email', verifyEmail as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/forgot-password', forgotPassword as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);

export default router;