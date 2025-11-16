// controllers/payment.controller.ts
import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary'; // pastikan sudah setup cloudinary config

export class PaymentController {
  // Midtrans initialize
  static async initializeMidtransPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await PaymentService.initializeMidtransPayment(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Manual payment upload
  static async uploadManualPayment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      if (!req.file) {
        return res.status(400).json({ error: 'Payment proof image is required' });
      }

      const { order_id } = req.body;
      if (!order_id) return res.status(400).json({ error: 'order_id is required' });

      // Upload ke Cloudinary
      const uploadResult = await uploadToCloudinary(req.file);
  
      const result = await PaymentService.uploadManualPayment({
        order_id: parseInt(order_id),
        proof_image: uploadResult.url,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get payment status
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

  // Midtrans webhook
  static async handleWebhook(req: AuthRequest, res: Response) {
    try {
      const result = await PaymentService.handleMidtransWebhook(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async verifyManualPayment(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user.userId; // user yang melakukan verifikasi
      const { order_id, isVerified } = req.body;

      if (!order_id) return res.status(400).json({ success: false, error: 'order_id is required' });
      if (typeof isVerified !== 'boolean') return res.status(400).json({ success: false, error: 'isVerified must be boolean' });

      const result = await PaymentService.verifyManualPayment(
        parseInt(order_id),
        adminId,
        isVerified
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

}
