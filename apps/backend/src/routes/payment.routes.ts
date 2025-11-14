// routes/payment.routes.ts - QUICK FIX
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken} from '../middleware/auth';
import { uploadPaymentProof } from '../middleware/upload.middleware';

const router = Router();

// Apply middleware dengan any type
router.use(authenticateToken);

// Routes dengan any type
router.post('/midtrans/initialize', PaymentController.initializeMidtransPayment as any);
router.post('/manual/upload', uploadPaymentProof as any, PaymentController.uploadManualPayment as any);
router.get('/status/:orderId', PaymentController.getPaymentStatus as any);
router.post('/webhook/midtrans', PaymentController.handleWebhook as any);

export default router;