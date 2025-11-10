// src/routes/order.routes.ts
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  createOrderSchema, 
  orderIdSchema, 
  cancelOrderSchema, 
  confirmOrderSchema,
  paginationSchema 
} from '../validations/order.validation';

const router = Router();

router.use(authenticate as any);

router.get('/', validate(paginationSchema), (req, res) => OrderController.getOrders(req as any, res));
router.get('/:id', validate(orderIdSchema), (req, res) => OrderController.getOrder(req as any, res));
router.post('/', validate(createOrderSchema), (req, res) => OrderController.createOrder(req as any, res));
router.post('/:id/cancel', validate(cancelOrderSchema), (req, res) => OrderController.cancelOrder(req as any, res));
router.post('/:id/confirm', validate(confirmOrderSchema), (req, res) => OrderController.confirmOrder(req as any, res));

export default router;