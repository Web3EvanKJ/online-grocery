// src/controllers/cart.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { BaseController } from './base.controller';
import { CartService } from '../services/cart.service';

export class CartController extends BaseController {
  static async getCart(req: AuthRequest, res: Response) {
    try {
      const cart = await CartService.getCart(req.user.id);
      this.handleSuccess(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async addToCart(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity } = req.body;
      const cartItem = await CartService.addToCart(req.user.id, productId, quantity);
      this.handleCreated(res, cartItem, 'Item added to cart');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async updateCart(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const cartItem = await CartService.updateCart(parseInt(id), req.user.id, quantity);
      this.handleSuccess(res, cartItem, 'Cart updated successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async removeFromCart(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await CartService.removeFromCart(parseInt(id), req.user.id);
      this.handleSuccess(res, result, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async clearCart(req: AuthRequest, res: Response) {
    try {
      const result = await CartService.clearCart(req.user.id);
      this.handleSuccess(res, result, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getCartCount(req: AuthRequest, res: Response) {
    try {
      const count = await CartService.getCartCount(req.user.id);
      this.handleSuccess(res, { count }, 'Cart count retrieved');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}