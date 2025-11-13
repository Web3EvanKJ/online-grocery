import { Router } from 'express';
import { AdminOrderController } from '../controllers/admin-order.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// Order management
router.get('/orders', AdminOrderController.getAllOrders);
router.get('/orders/:id', AdminOrderController.getOrderDetails);
router.patch('/orders/:id/status', AdminOrderController.updateOrderStatus);
router.patch('/orders/:id/verify-payment', AdminOrderController.verifyPayment);
router.patch('/orders/:id/cancel', AdminOrderController.cancelOrder);

export default router;