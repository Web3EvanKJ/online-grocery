import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken, requireVerifiedUser } from '../middleware/auth';

const router = Router();

// All order routes require authenticated & verified user
router.use(authenticateToken, requireVerifiedUser);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/:id/status', OrderController.getOrderStatus); // NEW
router.patch('/:id/cancel', OrderController.cancelOrder);  // UPDATED
router.patch('/:id/confirm', OrderController.confirmOrder); // NEW

export default router;