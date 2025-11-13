import { prisma } from '../utils/prisma';

export class OrderTransactionService {
  static async createOrderTransaction(
    userId: number, 
    orderData: any, 
    orderItems: any[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.orders.create({
        data: {
          user_id: userId,
          store_id: orderData.storeId,
          address_id: orderData.addressId,
          shipping_method_id: orderData.shippingMethodId,
          total_amount: orderData.totalAmount,
          shipping_cost: orderData.shippingCost,
          discount_amount: orderData.discountAmount || 0,
          status: 'Menunggu_Pembayaran'
        }
      });

      // Create order items
      await this.createOrderItems(tx, order.id, orderItems);

      // Create payment
      await this.createPayment(tx, order.id, orderData.paymentMethod);

      // Clear cart
      await this.clearCart(tx, userId);

      return order;
    });
  }

  private static async createOrderItems(tx: any, orderId: number, items: any[]) {
    await tx.order_items.createMany({
      data: items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: 0
      }))
    });
  }

  private static async createPayment(tx: any, orderId: number, method: string) {
    await tx.payments.create({
      data: { order_id: orderId, method: method }
    });
  }

  private static async clearCart(tx: any, userId: number) {
    await tx.carts.deleteMany({ where: { user_id: userId } });
  }
}