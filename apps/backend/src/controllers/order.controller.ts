// src/controllers/order.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { BaseController } from './base.controller';
import { OrderService } from '../services/order.service';

export class OrderController extends BaseController {
  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const order = await OrderService.createOrder(req.user.id, req.body);
      this.handleCreated(res, order, 'Order created successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await OrderService.getOrders(req.user.id, page, limit);
      this.handleSuccess(res, { orders: result.orders, pagination: result.pagination }, 'Orders retrieved');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(parseInt(id), req.user.id);
      this.handleSuccess(res, order, 'Order retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await OrderService.cancelOrder(parseInt(id), req.user.id, reason);
      this.handleSuccess(res, result, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async confirmOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await OrderService.confirmOrder(parseInt(id), req.user.id);
      this.handleSuccess(res, result, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}