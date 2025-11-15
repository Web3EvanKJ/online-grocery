// controllers/payment.controller.ts
import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  static async initializeMidtransPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      console.log('initializeMidtransPayment req.body', req.body);

      const result = await PaymentService.initializeMidtransPayment(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async uploadManualPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      if (!req.file) {
        return res.status(400).json({ error: 'Payment proof image is required' });
      }

      const { order_id } = req.body;

      const result = await PaymentService.uploadManualPayment({
        order_id: parseInt(order_id),
        proof_image: req.file.path,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getPaymentStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const orderId = parseInt(req.params.orderId);
      const payment = await PaymentService.getPaymentStatus(orderId);

      res.json({ success: true, data: payment });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async handleWebhook(req: AuthRequest, res: Response) {
    try {
      const result = await PaymentService.handleMidtransWebhook(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
