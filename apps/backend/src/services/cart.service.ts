import { prisma } from '../utils/prisma';
import { AddToCartRequest, UpdateCartRequest } from '../types/cart';

export class CartService {
  static async getCart(userId: number) {
    return await prisma.carts.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });
  }

  static async addToCart(userId: number, data: AddToCartRequest) {
    // Check product existence and stock
    const product = await prisma.products.findUnique({
      where: { id: data.product_id },
      include: { inventories: true }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already in cart
    const existingCart = await prisma.carts.findFirst({
      where: {
        user_id: userId,
        product_id: data.product_id
      }
    });

    if (existingCart) {
      // Update quantity
      return await prisma.carts.update({
        where: { id: existingCart.id },
        data: { quantity: existingCart.quantity + data.quantity },
        include: { product: { include: { images: true } } }
      });
    }

    // Add new item
    return await prisma.carts.create({
      data: {
        user_id: userId,
        product_id: data.product_id,
        quantity: data.quantity
      },
      include: { product: { include: { images: true } } }
    });
  }

  static async updateCartItem(cartId: number, userId: number, data: UpdateCartRequest) {
    return await prisma.carts.update({
      where: { 
        id: cartId,
        user_id: userId 
      },
      data: { quantity: data.quantity },
      include: { product: { include: { images: true } } }
    });
  }

  static async removeFromCart(cartId: number, userId: number) {
    return await prisma.carts.delete({
      where: { 
        id: cartId,
        user_id: userId 
      }
    });
  }

  static async clearCart(userId: number) {
    try {
      return await prisma.carts.deleteMany({
        where: { user_id: userId },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}