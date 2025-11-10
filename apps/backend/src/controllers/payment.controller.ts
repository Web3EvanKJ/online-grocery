// src/controllers/payment.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { BaseController } from './base.controller';
import { PaymentService } from '../services/payment.service';

export class PaymentController extends BaseController {
  static async uploadPaymentProof(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.body;
      
      if (!req.file) {
        this.handleError(res, new Error('Payment proof image is required'));
        return;
      }

      const result = await PaymentService.uploadPaymentProof(orderId, req.file.buffer);
      this.handleSuccess(res, result, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async createPayment(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.body;
      const transaction = await PaymentService.createMidtransTransaction(orderId, req.user);
      this.handleSuccess(res, transaction, 'Payment transaction created');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async handleMidtransNotification(req: AuthRequest, res: Response) {
    try {
      await PaymentService.handleMidtransNotification(req.body);
      this.handleSuccess(res, null, 'Notification processed');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}