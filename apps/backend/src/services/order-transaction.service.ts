// src/services/order-transaction.service.ts
import { prisma } from '../utils/prisma';

export class OrderTransactionService {
  static async createOrderTransaction(
    userId: number,
    orderData: any,
    orderItems: any[],
    cartItems: any[],
    voucher: any
  ) {
    return await prisma.$transaction(async (tx) => {
      const newOrder = await this.createOrder(tx, userId, orderData, voucher);
      await this.createOrderItems(tx, newOrder.id, orderItems);
      await this.updateInventory(tx, cartItems, orderData.storeId, newOrder.id);
      await this.clearCart(tx, userId);
      await this.createPayment(tx, newOrder.id, orderData.paymentMethod);

      return this.getOrderWithDetails(tx, newOrder.id);
    });
  }

  private static async createOrder(tx: any, userId: number, orderData: any, voucher: any) {
    return await tx.orders.create({
      data: {
        user_id: userId,
        store_id: orderData.storeId,
        address_id: orderData.addressId,
        voucher_id: voucher?.id,
        shipping_method_id: orderData.shippingMethodId,
        total_amount: orderData.totalAmount,
        shipping_cost: orderData.shippingCost,
        discount_amount: orderData.discountAmount,
        status: orderData.paymentMethod === 'payment_gateway' 
          ? 'Menunggu_Konfirmasi_Pembayaran' 
          : 'Menunggu_Pembayaran',
        expired_at: new Date(Date.now() + 60 * 60 * 1000)
      }
    });
  }

  private static async createOrderItems(tx: any, orderId: number, orderItems: any[]) {
    for (const item of orderItems) {
      await tx.order_items.create({
        data: { order_id: orderId, ...item }
      });
    }
  }

  private static async updateInventory(tx: any, cartItems: any[], storeId: number, orderId: number) {
    for (const cartItem of cartItems) {
      const inventory = await tx.inventories.findFirst({
        where: { product_id: cartItem.product_id, store_id: storeId }
      });

      if (inventory) {
        await tx.inventories.update({
          where: { id: inventory.id },
          data: { stock: { decrement: cartItem.quantity } }
        });

        await tx.stock_journals.create({
          data: {
            inventory_id: inventory.id,
            type: 'out',
            quantity: cartItem.quantity,
            note: `Order #${orderId}`
          }
        });
      }
    }
  }

  private static async clearCart(tx: any, userId: number) {
    await tx.carts.deleteMany({ where: { user_id: userId } });
  }

  private static async createPayment(tx: any, orderId: number, paymentMethod: string) {
    await tx.payments.create({
      data: {
        order_id: orderId,
        method: paymentMethod,
        is_verified: paymentMethod === 'payment_gateway'
      }
    });
  }

  private static async getOrderWithDetails(tx: any, orderId: number) {
    return await tx.orders.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        address: true,
        shipping_method: true,
        order_items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        },
        payments: true
      }
    });
  }
}