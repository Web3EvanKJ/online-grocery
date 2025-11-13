
// controllers/payment.controller.ts
import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { OrderEmailService } from '../services/order-email.service'; // ✅ Import yang benar
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  static async uploadManualPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      if (!req.file) {
        return res.status(400).json({ error: 'Payment proof image is required' });
      }

      const { order_id } = req.body;
      
      const result = await PaymentService.uploadManualPayment({
        order_id: parseInt(order_id),
        proof_image: req.file.path // Local file path
      });
      
      // Send email notification - FIX: pake OrderEmailService
      await OrderEmailService.sendPaymentProofUploaded(parseInt(order_id));
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPaymentStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.orderId);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const payment = await PaymentService.getPaymentStatus(orderId);
      res.json(payment);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async handleWebhook(req: AuthRequest, res: Response) {
    try {
      // Webhook doesn't require authentication
      const result = await PaymentService.handleMidtransWebhook(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}