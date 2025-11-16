import { prisma } from '../utils/prisma';

export class OrderTransactionService {
  static async createOrderTransaction(
    userId: number, 
    orderData: {
      storeId: number;
      addressId: number;
      shippingMethodId: number;
      totalAmount: number;
      shippingCost: number;
      discountAmount?: number;
      paymentMethod: string;
    }, 
    orderItems: { product_id: number; quantity: number; price: number }[]
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

      // Create order items and reduce stock
      await this.createOrderItems(tx, order.id, order.store_id, orderItems);

      // Create payment record
      await this.createPayment(tx, order.id, orderData.paymentMethod);

      // Clear cart
      await this.clearCart(tx, userId);

      return order;
    });
  }

  private static async createOrderItems(
    tx: any, 
    orderId: number, 
    storeId: number,
    items: { product_id: number; quantity: number; price: number }[]
  ) {
    // Create order items
    await tx.order_items.createMany({
      data: items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: 0
      }))
    });

    // Reduce stock for each item
    for (const item of items) {
      const inventory = await tx.inventories.findFirst({
        where: {
          product_id: item.product_id,
          store_id: storeId
        }
      });

      if (inventory) {
        // Decrease stock
        await tx.inventories.update({
          where: { id: inventory.id },
          data: { stock: { decrement: item.quantity } }
        });

        // Create stock journal
        await tx.stock_journals.create({
          data: {
            inventory_id: inventory.id,
            type: 'out',
            quantity: item.quantity,
            note: `Order #${orderId} created`
          }
        });
      }
    }
  }

  private static async createPayment(tx: any, orderId: number, method: string) {
    await tx.payments.create({
      data: { 
        order_id: orderId, 
        method: method,
        is_verified: false // Always start as unverified
      }
    });
  }

  private static async clearCart(tx: any, userId: number) {
    await tx.carts.deleteMany({ where: { user_id: userId } });
  }
}