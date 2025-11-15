// src/services/order.service.ts
import { prisma } from '../utils/prisma';
import { DecimalHelper } from '../utils/decimal';
import { OrderValidationService } from './order-validation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderTransactionService } from './order-transaction.service';
import { CreateOrderRequest, OrderResponse } from '../types/order';
import { ShippingService } from './shipping.service';

export class OrderService {
  static async createOrder(userId: number, data: CreateOrderRequest): Promise<OrderResponse> {
    const address = await OrderValidationService.validateAddress(data.addressId, userId);
    const cartItems = await OrderValidationService.validateCart(userId);
    const nearestStore = await OrderValidationService.findNearestStore(
      Number(address.latitude), 
      Number(address.longitude)
    );

    await OrderValidationService.validateStock(cartItems, nearestStore.id);

    const { totalAmount, orderItems } = OrderCalculationService.calculateItemsTotal(cartItems);
    
    // FIX: Get shipping cost object and extract the cost
    const shippingResult = await ShippingService.calculateShippingCost({
      addressId: data.addressId,
      shippingMethodId: data.shippingMethodId,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        weight: 100 // 100g per item, simplified
      }))
    });

    const shippingCost = shippingResult.cost;
    const totalAmountWithShipping = totalAmount + shippingCost;

    const transactionData = {
      storeId: nearestStore.id,
      addressId: data.addressId,
      shippingMethodId: data.shippingMethodId,
      totalAmount: totalAmountWithShipping,
      shippingCost: shippingCost,
      paymentMethod: data.paymentMethod
    };

    const order = await OrderTransactionService.createOrderTransaction(
      userId, 
      transactionData, 
      orderItems
    );

    const orderDetails = await this.getOrderById(order.id, userId);
    return DecimalHelper.simpleConvert(orderDetails) as OrderResponse;
  }

  static async getOrders(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

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
          store: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          address: {
            select: {
              id: true,
              label: true,
              address_detail: true
            }
          },
          shipping_method: {
            select: {
              id: true,
              name: true,
              provider: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip, 
        take: limit
      }),
      prisma.orders.count({ where: { user_id: userId } })
    ]);

    // Convert Decimal values to numbers
    const convertedOrders = orders.map(order => ({
      ...order,
      total_amount: Number(order.total_amount),
      shipping_cost: Number(order.shipping_cost),
      discount_amount: order.discount_amount ? Number(order.discount_amount) : 0,
      order_items: order.order_items.map(item => ({
        ...item,
        price: Number(item.price),
        discount: item.discount ? Number(item.discount) : 0
      }))
    }));

    return {
      orders: convertedOrders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getOrderById(orderId: number, userId: number) {
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
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true
          }
        },
        address: {
          select: {
            id: true,
            label: true,
            address_detail: true,
            province: true,
            city: true,
            district: true
          }
        },
        shipping_method: {
          select: {
            id: true,
            name: true,
            provider: true
          }
        },
        voucher: {
          select: {
            id: true,
            code: true,
            type: true
          }
        }
      }
    });

    if (!order) throw new Error('Order not found');
    
    // Convert Decimal values manually
    return {
      ...order,
      total_amount: Number(order.total_amount),
      shipping_cost: Number(order.shipping_cost),
      discount_amount: order.discount_amount ? Number(order.discount_amount) : 0,
      order_items: order.order_items.map(item => ({
        ...item,
        price: Number(item.price),
        discount: item.discount ? Number(item.discount) : 0
      }))
    };
  }

  // ... rest of the methods remain the same
  static async cancelOrder(orderId: number, userId: number, reason: string) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: { order_items: true, payments: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate cancellation rules
    if (order.status !== 'Menunggu_Pembayaran') {
      throw new Error('Cannot cancel order after payment');
    }

    if (order.payments[0]?.is_verified) {
      throw new Error('Cannot cancel order with verified payment');
    }

    // Return stock and update order status
    await prisma.$transaction(async (tx) => {
      // Return stock to inventory
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

          // Create stock journal
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

      // Update order status
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
}