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
    const product = await prisma.products.findUnique({
      where: { id: data.product_id },
      include: { inventories: true }
    });

    if (!product) throw new Error('Product not found');

    const existingCart = await prisma.carts.findFirst({
      where: { user_id: userId, product_id: data.product_id }
    });

    if (existingCart) {
      return await prisma.carts.update({
        where: { id: existingCart.id },
        data: { quantity: existingCart.quantity + data.quantity },
        include: { product: { include: { images: true } } }
      });
    }

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
    const cart = await prisma.carts.findUnique({ where: { id: cartId } });

    if (!cart) throw new Error(`Cart not found for id ${cartId}`);
    if (cart.user_id !== userId) throw new Error(`Cart does not belong to user ${userId}`);

    return await prisma.carts.update({
      where: { id: cart.id },
      data: { quantity: data.quantity },
      include: { product: { include: { images: true } } }
    });
  }

  static async removeFromCart(cartId: number, userId: number) {
    const cart = await prisma.carts.findUnique({ where: { id: cartId } });

    if (!cart) throw new Error(`Cart not found for id ${cartId}`);
    if (cart.user_id !== userId) throw new Error(`Cart does not belong to user ${userId}`);

    return await prisma.carts.delete({ where: { id: cart.id } });
  }

  static async clearCart(userId: number) {
    return await prisma.carts.deleteMany({
      where: { user_id: userId },
    });
  }
}
