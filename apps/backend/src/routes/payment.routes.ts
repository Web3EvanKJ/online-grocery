import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';
import { uploadPaymentProof } from '../middleware/upload.middleware';

const router = Router();

// ==================
// Routes tanpa auth
// ==================
router.post('/webhook/midtrans', PaymentController.handleWebhook);

// ==================
// Routes dengan auth
// ==================
router.post('/midtrans/initialize', authenticateToken, PaymentController.initializeMidtransPayment);
router.post('/manual/upload', authenticateToken, uploadPaymentProof, PaymentController.uploadManualPayment);
router.get('/status/:orderId', authenticateToken, PaymentController.getPaymentStatus);

export default router;
