// src/services/order-transaction.service.ts
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
      voucherId?: number;
    },
    orderItems: { product_id: number; quantity: number; price: number }[]
  ) {

    const finalOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.orders.create({
        data: {
          user_id: userId,
          store_id: orderData.storeId,
          address_id: orderData.addressId,
          shipping_method_id: orderData.shippingMethodId,
          total_amount: orderData.totalAmount,
          shipping_cost: orderData.shippingCost,
          discount_amount: orderData.discountAmount || 0,
          voucher_id: orderData.voucherId,

          status: 'Menunggu_Pembayaran'
        }
      },
    );

      await this.createOrderItems(tx, created.id, created.store_id, orderItems);

      await this.createPayment(tx, created.id, orderData.paymentMethod);

      await this.clearCart(tx, userId);
      
      const orderWithRelations = await tx.orders.findUnique({
        where: { id: created.id },
        include: {
          order_items: {
            include: {
              product: {
                include: { images: true }
              }
            }
          },
          payments: true,
          address: true,
          shipping_method: true,
          store: true
        }
      });

      if (!orderWithRelations) {
        console.error("❌ ERROR: orderWithRelations is NULL!");
        throw new Error('Failed to fetch created order');
      }

      return orderWithRelations;
    });

    return finalOrder;
  }

  private static async createOrderItems(
    tx: any,
    orderId: number,
    storeId: number,
    items: { product_id: number; quantity: number; price: number }[]
  ) {

    if (!items || items.length === 0) {
      throw new Error('No order items provided');
    }

    await tx.order_items.createMany({
      data: items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: 0
      }))
    });

    for (const item of items) {
      const inventory = await tx.inventories.findFirst({
        where: {
          product_id: item.product_id,
          store_id: storeId
        }
      });

      if (!inventory) {
        throw new Error(`Inventory not found for product ${item.product_id} in store ${storeId}`);
      }

      if (inventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      await tx.inventories.update({
        where: { id: inventory.id },
        data: { stock: { decrement: item.quantity } }
      });

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

  private static async createPayment(tx: any, orderId: number, method: string) {

    if (!method) {
      throw new Error('Payment method is required');
    }

    await tx.payments.create({
      data: {
        order_id: orderId,
        method: method,
        is_verified: false
      }
    });
  }

  private static async clearCart(tx: any, userId: number) {
    await tx.carts.deleteMany({ where: { user_id: userId } });
  }
}
