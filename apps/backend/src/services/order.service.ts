// src/services/order.service.ts
import { prisma } from '../utils/prisma';
import { OrderValidationService } from './order-validation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderTransactionService } from './order-transaction.service';
import { CreateOrderRequest, OrderResponse } from '../types/order';
import { ShippingService } from './shipping.service';
import { OrderStatus } from '@prisma/client';
import { VoucherService } from './voucher.service';

export class OrderService {
  // Helper to convert Prisma Decimal to number
  private static convertDecimalsToNumbers(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDecimalsToNumbers(item));
    }
    
    if (typeof obj === 'object') {
      // Check if it's a Prisma Decimal
      if (obj.constructor && obj.constructor.name === 'Decimal') {
        return Number(obj.toString());
      }
      
      // Recursively convert nested objects
      const converted: any = {};
      for (const key in obj) {
        converted[key] = this.convertDecimalsToNumbers(obj[key]);
      }
      return converted;
    }
    
    return obj;
  }

  static async createOrder(userId: number, data: CreateOrderRequest): Promise<OrderResponse> {
    // 1) Validate address belongs to user
    const address = await OrderValidationService.validateAddress(data.addressId, userId);

    // 2) Get cart items (throws if empty)
    const cartItems = await OrderValidationService.validateCart(userId);

    // 3) Find nearest store to address
    const nearestStore = await OrderValidationService.findNearestStore(
      Number(address.latitude),
      Number(address.longitude)
    );

    // 4) Validate stock in that store
    await OrderValidationService.validateStock(cartItems, nearestStore.id);

    // 5) Calculate items total and build orderItems
    const { totalAmount, orderItems } = OrderCalculationService.calculateItemsTotal(cartItems);

    // 6) Calculate shipping cost
    const shippingResult = await ShippingService.calculateShippingCost({
      addressId: data.addressId,
      shippingMethodId: data.shippingMethodId,
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        weight: 100
      }))
    });

    if (!shippingResult || typeof shippingResult.cost !== 'number') {
      throw new Error('Failed to calculate shipping cost');
    }

    const shippingCost = shippingResult.cost;


    // 7) Validate voucher
    const { discountAmount, voucher } = await VoucherService.validateVoucher(
      data.voucherCode || '',
      userId,
      cartItems,
      totalAmount
    );

    // 8) Total final
    const totalAmountWithShipping = Number(totalAmount) + Number(shippingCost) - (discountAmount || 0);

    const transactionData = {
      storeId: nearestStore.id,
      addressId: data.addressId,
      shippingMethodId: data.shippingMethodId,
      totalAmount: totalAmountWithShipping,
      shippingCost: shippingCost,
      paymentMethod: data.paymentMethod || 'payment_gateway',
      voucherId: voucher?.id,
      discountAmount: discountAmount
    };

    // 9) Create order transaction
    const createdOrder = await OrderTransactionService.createOrderTransaction(
      userId, 
      transactionData, 
      orderItems
    );

    // 10) Fetch full order details and convert decimals
    const orderWithDetails = await this.getOrderById(createdOrder.id, userId);
    return orderWithDetails as OrderResponse;
  }

  static async getOrders(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    console.log('📦 Fetching orders for userId:', userId);

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: { user_id: userId },
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
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.orders.count({ where: { user_id: userId } })
    ]);

    console.log('📦 Found orders count:', orders.length);
    console.log('📦 Total in DB:', total);

    // Convert decimals to numbers
    const convertedOrders = this.convertDecimalsToNumbers(orders);

    return {
      orders: convertedOrders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getOrderById(orderId: number, userId: number) {
    console.log('📦 Fetching order:', orderId, 'for user:', userId);

    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
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

    console.log('📦 Order found:', order ? 'YES' : 'NO');

    if (!order) throw new Error('Order not found');

    // Convert decimals to numbers
    return this.convertDecimalsToNumbers(order);
  }
  
  static async cancelOrder(orderId: number, userId: number, reason: string) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: { order_items: true, payments: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'Menunggu_Pembayaran') {
      throw new Error('Cannot cancel order after payment');
    }

    if (order.payments[0]?.is_verified) {
      throw new Error('Cannot cancel order with verified payment');
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.order_items) {
        const inventory = await tx.inventories.findFirst({
          where: { 
            product_id: item.product_id, 
            store_id: order.store_id 
          }
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
              note: `Order #${order.id} cancelled: ${reason}`
            }
          });
        }
      }

      await tx.orders.update({
        where: { id: order.id },
        data: { status: 'Dibatalkan' }
      });
    });

    return { message: 'Order cancelled successfully' };
  }

  static async confirmOrderDelivery(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: { 
        id: orderId, 
        user_id: userId,
        status: 'Dikirim' 
      }
    });

    if (!order) {
      throw new Error('Order not found or cannot be confirmed');
    }

    await prisma.orders.update({
      where: { id: orderId },
      data: { status: 'Pesanan_Dikonfirmasi' }
    });

    return { message: 'Order confirmed successfully' };
  }

  static async getOrderStatus(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      select: { 
        id: true,
        status: true,
        created_at: true,
        updated_at: true,
        payments: {
          select: {
            method: true,
            is_verified: true,
            proof_image: true
          }
        }
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  static async updateOrderStatus(orderId: number, status: string) {
    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const allowedStatuses = [
      'Menunggu_Pembayaran', 
      'Menunggu_Konfirmasi_Pembayaran',
      'Diproses',
      'Dikirim', 
      'Pesanan_Dikonfirmasi', 
      'Dibatalkan'
    ];
    
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const updated = await prisma.orders.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
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

    return this.convertDecimalsToNumbers(updated);
  }
}