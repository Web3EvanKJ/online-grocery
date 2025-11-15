// src/routes/shipping.routes.ts
import { Router } from 'express';
import { ShippingController } from '../controllers/shipping.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all shipping methods
router.get('/methods', authenticateToken, ShippingController.getShippingMethods);

// Calculate shipping cost
router.post('/calculate', authenticateToken, ShippingController.calculateCost);

export default router;
