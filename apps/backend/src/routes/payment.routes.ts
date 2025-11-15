// routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';
import { uploadPaymentProof } from '../middleware/upload.middleware';

const router = Router();

// Semua route pakai auth
router.use(authenticateToken);

// Midtrans initialize
router.post('/midtrans/initialize', PaymentController.initializeMidtransPayment);

// Manual upload
router.post('/manual/upload', uploadPaymentProof, PaymentController.uploadManualPayment);

// Get payment status
router.get('/status/:orderId', PaymentController.getPaymentStatus);

// Midtrans webhook
router.post('/webhook/midtrans', PaymentController.handleWebhook);

export default router;
