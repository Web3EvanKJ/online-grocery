import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response) {
    try {

      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const order = await OrderService.createOrder(userId, req.body);
      
      // Return consistent structure
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      res.status(400).json({ success: false, error: message });
    }
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await OrderService.getOrders(userId, page, limit);
      
      // Return consistent structure
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch orders';
      res.status(500).json({ success: false, error: message });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const orderId = parseInt(req.params.id);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const order = await OrderService.getOrderById(orderId, userId);
      
      // Return consistent structure
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Order not found';
      res.status(404).json({ success: false, error: message });
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const orderId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      if (!reason) return res.status(400).json({ error: 'Cancellation reason is required' });

      const result = await OrderService.cancelOrder(orderId, userId, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel order';
      res.status(400).json({ success: false, error: message });
    }
  }

  static async confirmOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const orderId = parseInt(req.params.id);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await OrderService.confirmOrderDelivery(orderId, userId);
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm order';
      res.status(400).json({ success: false, error: message });
    }
  }

  static async getOrderStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const orderId = parseInt(req.params.id);
      
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const status = await OrderService.getOrderStatus(orderId, userId);
      res.json({ success: true, data: status });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get order status';
      res.status(404).json({ success: false, error: message });
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const userRole = req.user.role; // pastikan role di JWT
      if (!['admin', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
      }

      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);

      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order status';
      res.status(400).json({ success: false, error: message });
    }
  }

}