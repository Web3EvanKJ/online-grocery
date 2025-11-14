import { Response } from 'express';
import { AdminOrderService } from '../services/admin-order.service';
import { AuthRequest } from '../middleware/auth';
import { OrderStatus } from '@prisma/client';

export class AdminOrderController {
  static async getAllOrders(req: AuthRequest, res: Response) {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await AdminOrderService.getAllOrders(storeId, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.userId;
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
      if (!status) return res.status(400).json({ error: 'Status is required' });

      const result = await AdminOrderService.updateOrderStatus(orderId, status as OrderStatus, adminId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.userId;
      const orderId = parseInt(req.params.id);
      const { isVerified } = req.body;

      if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
      if (typeof isVerified !== 'boolean') {
        return res.status(400).json({ error: 'isVerified must be boolean' });
      }

      const result = await AdminOrderService.verifyPayment(orderId, adminId, isVerified);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.userId;
      const orderId = parseInt(req.params.id);
      const { reason } = req.body;

      if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
      if (!reason) return res.status(400).json({ error: 'Cancellation reason is required' });

      const result = await AdminOrderService.cancelOrderByAdmin(orderId, adminId, reason);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getOrderDetails(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.userId;
      const orderId = parseInt(req.params.id);

      if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

      const order = await AdminOrderService.getOrderDetails(orderId);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}