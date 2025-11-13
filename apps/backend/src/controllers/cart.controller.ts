import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  static async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cart = await CartService.getCart(userId);
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addToCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cartItem = await CartService.addToCart(userId, req.body);
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateCartItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const cartId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cartItem = await CartService.updateCartItem(cartId, userId, req.body);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async removeFromCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const cartId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await CartService.removeFromCart(cartId, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}