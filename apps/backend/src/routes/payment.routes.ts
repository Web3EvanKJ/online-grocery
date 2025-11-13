// routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken, requireVerifiedUser } from '../middleware/auth';
import { uploadPaymentProof } from '../middleware/upload.middleware';

const router = Router();

// Apply auth middleware to router instance
router.use(authenticateToken);
router.use(requireVerifiedUser);

// Routes
router.post('/midtrans/initialize', PaymentController.initializePayment);
router.post('/manual/upload', uploadPaymentProof, (req, res) => {
  PaymentController.uploadManualPayment(req as AuthRequest, res);
});
router.get('/status/:orderId', PaymentController.getPaymentStatus);
router.post('/webhook/midtrans', PaymentController.handleWebhook);

export default router;