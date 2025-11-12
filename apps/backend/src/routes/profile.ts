import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  resendVerification,
} from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/resend-verification', authenticateToken, resendVerification);

export default router;