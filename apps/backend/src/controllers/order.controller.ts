import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const order = await OrderService.createOrder(userId, req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await OrderService.getOrders(userId, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.id);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const order = await OrderService.getOrderById(orderId, userId);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      if (!reason) return res.status(400).json({ error: 'Cancellation reason is required' });

      const result = await OrderService.cancelOrder(orderId, userId, reason);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async confirmOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.id);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await OrderService.confirmOrderDelivery(orderId, userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getOrderStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.id);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const status = await OrderService.getOrderStatus(orderId, userId);
      res.json(status);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}