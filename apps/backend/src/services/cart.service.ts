// src/services/cart.service.ts
import { prisma } from '../utils/prisma';
import { CartItem, ProductWithDetails } from '../types/cart';

export class CartService {
  static async getCart(userId: number): Promise<CartItem[]> {
    const cartItems = await prisma.carts.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            images: true,
            inventories: {
              include: {
                store: true
              }
            }
          }
        }
      }
    });

    const validCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const availableStock = item.product.inventories.reduce(
          (total, inv) => total + inv.stock,
          0
        );

        const productWithDetails: ProductWithDetails = {
          ...item.product,
          price: item.product.price.toNumber(),
          availableStock,
          isAvailable: availableStock >= item.quantity
        };

        return {
          ...item,
          product: productWithDetails
        };
      })
    );

    return validCartItems;
  }

  static async addToCart(userId: number, productId: number, quantity: number) {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        inventories: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const totalStock = product.inventories.reduce((sum, inv) => sum + inv.stock, 0);
    
    if (totalStock < quantity) {
      throw new Error('Insufficient stock');
    }

    const existingCartItem = await prisma.carts.findFirst({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (totalStock < newQuantity) {
        throw new Error('Insufficient stock for additional quantity');
      }

      const updatedCart = await prisma.carts.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      });

      return updatedCart;
    }

    const newCartItem = await prisma.carts.create({
      data: {
        user_id: userId,
        product_id: productId,
        quantity
      },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });

    return newCartItem;
  }

  static async updateCart(cartId: number, userId: number, quantity: number) {
    const cartItem = await prisma.carts.findFirst({
      where: {
        id: cartId,
        user_id: userId
      },
      include: {
        product: {
          include: {
            inventories: true
          }
        }
      }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    const totalStock = cartItem.product.inventories.reduce(
      (sum, inv) => sum + inv.stock,
      0
    );

    if (totalStock < quantity) {
      throw new Error('Insufficient stock');
    }

    const updatedCart = await prisma.carts.update({
      where: { id: cartId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });

    return updatedCart;
  }

  static async removeFromCart(cartId: number, userId: number) {
    const cartItem = await prisma.carts.findFirst({
      where: {
        id: cartId,
        user_id: userId
      }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    await prisma.carts.delete({
      where: { id: cartId }
    });

    return { message: 'Item removed from cart' };
  }

  static async clearCart(userId: number) {
    await prisma.carts.deleteMany({
      where: { user_id: userId }
    });

    return { message: 'Cart cleared' };
  }

  static async getCartCount(userId: number): Promise<number> {
    const count = await prisma.carts.aggregate({
      where: { user_id: userId },
      _sum: {
        quantity: true
      }
    });

    return count._sum.quantity || 0;
  }
}