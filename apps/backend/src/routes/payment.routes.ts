// src/routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validation.middleware';
import { uploadPaymentSchema } from '../validations/order.validation';

const router = Router();

// Public route for Midtrans webhook
router.post('/midtrans-notification', (req, res) => PaymentController.handleMidtransNotification(req as any, res));

// Protected routes
router.use(authenticate as any);

router.post(
  '/upload-proof', 
  upload.single('proofImage'),
  validate(uploadPaymentSchema),
  (req, res) => PaymentController.uploadPaymentProof(req as any, res)
);

router.post('/create-transaction', (req, res) => PaymentController.createPayment(req as any, res));

export default router;