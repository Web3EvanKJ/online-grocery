import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';
import { authorizeRole } from '../middleware/authorizeRole';

const router = Router();

// Semua route harus login
router.use(authenticateToken);

// Hanya admin atau superadmin
router.use(authorizeRole(['store_admin', 'super_admin']));

// Admin verifikasi pembayaran manual
router.patch('/verify', PaymentController.verifyManualPayment);

export default router;
