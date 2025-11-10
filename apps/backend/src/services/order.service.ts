// src/services/order.service.ts
import { prisma } from '../utils/prisma';
import { OrderValidationService } from './order-validation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderTransactionService } from './order-transaction.service';
import { CreateOrderRequest, OrderResponse } from '../types/order';
import { EmailService } from './email.service';
import { AdminEmailService } from './admin-email.service';

export class OrderService {
  static async createOrder(userId: number, orderData: CreateOrderRequest): Promise<OrderResponse> {
    const { addressId, shippingMethodId, voucherCode, paymentMethod } = orderData;

    const address = await OrderValidationService.validateAddress(userId, addressId);
    const cartItems = await OrderValidationService.validateCart(userId);
    const nearestStore = await OrderValidationService.findNearestStore(
      Number(address.latitude),
      Number(address.longitude)
    );

    await OrderValidationService.validateStock(cartItems, nearestStore.id);

    const { totalAmount, discountAmount, orderItems } = 
      OrderCalculationService.calculateItemsTotal(cartItems);

    const { discount: voucherDiscount, voucher } = 
    // await OrderCalculationService.applyVoucherDiscount(voucherCode, totalAmount);
      await OrderCalculationService.applyVoucherDiscount(voucherCode || '', totalAmount);

    const finalDiscountAmount = discountAmount + voucherDiscount;
    const amountAfterDiscount = totalAmount - voucherDiscount;

    const shippingCost = await OrderCalculationService.calculateShipping(
      addressId,
      shippingMethodId,
      cartItems,
      nearestStore
    );

    const finalAmount = amountAfterDiscount + shippingCost;

    const transactionData = {
      storeId: nearestStore.id,
      addressId,
      shippingMethodId,
      totalAmount: finalAmount,
      shippingCost,
      discountAmount: finalDiscountAmount,
      paymentMethod
    };

    const order = await OrderTransactionService.createOrderTransaction(
      userId,
      transactionData,
      orderItems,
      cartItems,
      voucher
    );

    // Send order confirmation email
    await EmailService.sendOrderConfirmation(order.id);
    // Send admin notifications
    await AdminEmailService.sendNewOrderNotification(order.id);

    return order as OrderResponse;
  }

  static async getOrders(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.fetchUserOrders(userId, skip, limit),
      this.countUserOrders(userId)
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  private static async fetchUserOrders(userId: number, skip: number, limit: number) {
    return await prisma.orders.findMany({
      where: { user_id: userId },
      include: this.getOrderInclude(),
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });
  }

  private static async countUserOrders(userId: number) {
    return await prisma.orders.count({ where: { user_id: userId } });
  }

  private static getOrderInclude() {
    return {
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
    };
  }

  static async cancelOrder(orderId: number, userId: number, reason: string) {
    const order = await this.validateOrderCancellation(orderId, userId);

    await this.processOrderCancellation(order, reason);
    // Send cancellation email
    await EmailService.sendOrderCancellationNotification(orderId, reason);

    return { message: 'Order cancelled successfully' };
  }

  private static async validateOrderCancellation(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: { order_items: true, payments: true }
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'Menunggu_Pembayaran') {
      throw new Error('Cannot cancel order after payment');
    }
    if (order.payments[0]?.is_verified) {
      throw new Error('Cannot cancel verified payment order');
    }

    return order;
  }

  private static async processOrderCancellation(order: any, reason: string) {
    await prisma.$transaction(async (tx) => {
      await this.restoreInventory(tx, order, reason);
      await this.updateOrderStatus(tx, order.id);
    });
  }

  private static async restoreInventory(tx: any, order: any, reason: string) {
    for (const item of order.order_items) {
      const inventory = await tx.inventories.findFirst({
        where: { product_id: item.product_id, store_id: order.store_id }
      });

      if (inventory) {
        await tx.inventories.update({
          where: { id: inventory.id },
          data: { stock: { increment: item.quantity } }
        });

        await tx.stock_journals.create({
          data: {
            inventory_id: inventory.id,
            type: 'in',
            quantity: item.quantity,
            note: `Order #${order.id} cancellation: ${reason}`
          }
        });
      }
    }
  }

  private static async updateOrderStatus(tx: any, orderId: number) {
    await tx.orders.update({
      where: { id: orderId },
      data: { status: 'Dibatalkan' }
    });
  }

  static async confirmOrder(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId, status: 'Dikirim' }
    });

    if (!order) throw new Error('Order not found or cannot be confirmed');

    await prisma.orders.update({
      where: { id: orderId },
      data: { status: 'Pesanan_Dikonfirmasi' }
    });

    // Send delivery confirmation email
    await EmailService.sendOrderDeliveredNotification(orderId);

    return { message: 'Order confirmed successfully' };
  }

  static async getOrderById(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: this.getOrderDetailInclude()
    });

    if (!order) throw new Error('Order not found');

    return order;
  }

  private static getOrderDetailInclude() {
    return {
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
      payments: true,
      voucher: true
    };
  }
}