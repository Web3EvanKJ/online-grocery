// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.js';
import addressRoutes from './addresses.js';
import profileRoutes from './profile.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/profile', profileRoutes);

export default router;