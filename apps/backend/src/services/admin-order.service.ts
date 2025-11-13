import { prisma } from '../utils/prisma';
import { OrderStatus } from '@prisma/client';

export class AdminOrderService {
  static async getAllOrders(storeId?: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where = storeId ? { store_id: storeId } : {};

    const [orders, total] = await Promise.all([
      this.fetchOrders(where, skip, limit),
      this.countOrders(where)
    ]);

    return this.formatPaginationResponse(orders, total, page, limit);
  }

  static async updateOrderStatus(orderId: number, status: OrderStatus, adminId: number) {
    await this.validateOrderExists(orderId);
    
    const updatedOrder = await this.updateOrderStatusInDb(orderId, status);
    
    if (status === 'Diproses') {
      await this.reduceStockForOrder(orderId);
    }

    return updatedOrder;
  }

  static async verifyPayment(orderId: number, adminId: number, isVerified: boolean) {
    const payment = await this.findPaymentByOrderId(orderId);
    const updatedPayment = await this.updatePaymentVerification(payment.id, adminId, isVerified);
    
    await this.updateOrderStatusAfterVerification(orderId, isVerified);
    
    return updatedPayment;
  }

  static async cancelOrderByAdmin(orderId: number, adminId: number, reason: string) {
    const order = await this.findOrderWithItems(orderId);
    
    await this.processAdminCancellation(order, reason);
    return { message: 'Order cancelled by admin successfully' };
  }

  static async getOrderDetails(orderId: number) {
    const order = await this.fetchOrderWithDetails(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // ========== PRIVATE METHODS (MAX 15 LINES EACH) ==========

  private static async fetchOrders(where: any, skip: number, limit: number) {
    return await prisma.orders.findMany({
      where,
      include: this.getOrderIncludeFields(),
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });
  }

  private static async countOrders(where: any) {
    return await prisma.orders.count({ where });
  }

  private static getOrderIncludeFields() {
    return {
      order_items: {
        include: {
          product: {
            include: { images: true }
          }
        }
      },
      payments: true,
      user: {
        select: { name: true, email: true, phone: true }
      },
      store: true,
      address: true
    };
  }

  private static formatPaginationResponse(orders: any[], total: number, page: number, limit: number) {
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private static async validateOrderExists(orderId: number) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }
  }

  private static async updateOrderStatusInDb(orderId: number, status: OrderStatus) {
    return await prisma.orders.update({
      where: { id: orderId },
      data: { status }
    });
  }

  private static async reduceStockForOrder(orderId: number) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true }
    });

    if (!order) return;

    for (const item of order.order_items) {
      await this.processStockReduction(item, order.store_id, orderId);
    }
  }

  private static async processStockReduction(item: any, storeId: number, orderId: number) {
    const inventory = await prisma.inventories.findFirst({
      where: { 
        product_id: item.product_id, 
        store_id: storeId 
      }
    });

    if (inventory) {
      await this.updateInventoryStock(inventory.id, item.quantity);
      await this.createStockJournal(inventory.id, item.quantity, orderId, 'out');
    }
  }

  private static async updateInventoryStock(inventoryId: number, quantity: number) {
    await prisma.inventories.update({
      where: { id: inventoryId },
      data: { stock: { decrement: quantity } }
    });
  }

  private static async createStockJournal(inventoryId: number, quantity: number, orderId: number, type: 'in' | 'out') {
    await prisma.stock_journals.create({
      data: {
        inventory_id: inventoryId,
        type,
        quantity,
        note: `Order #${orderId} ${type === 'out' ? 'processed' : 'cancelled'}`
      }
    });
  }

  private static async findPaymentByOrderId(orderId: number) {
    const payment = await prisma.payments.findFirst({
      where: { order_id: orderId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  private static async updatePaymentVerification(paymentId: number, adminId: number, isVerified: boolean) {
    return await prisma.payments.update({
      where: { id: paymentId },
      data: { 
        is_verified: isVerified,
        verified_by: adminId
      }
    });
  }

  private static async updateOrderStatusAfterVerification(orderId: number, isVerified: boolean) {
    const orderStatus: OrderStatus = isVerified 
      ? 'Menunggu_Konfirmasi_Pembayaran' 
      : 'Menunggu_Pembayaran';
    
    await prisma.orders.update({
      where: { id: orderId },
      data: { status: orderStatus }
    });
  }

  private static async findOrderWithItems(orderId: number) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true, payments: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  private static async processAdminCancellation(order: any, reason: string) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.order_items) {
        await this.returnStockToInventory(tx, item, order.store_id, order.id, reason);
      }

      await this.updateOrderCancellationStatus(tx, order.id);
    });
  }

  private static async returnStockToInventory(tx: any, item: any, storeId: number, orderId: number, reason: string) {
    const inventory = await tx.inventories.findFirst({
      where: { 
        product_id: item.product_id, 
        store_id: storeId 
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
          note: `Order #${orderId} cancelled by admin: ${reason}`
        }
      });
    }
  }

  private static async updateOrderCancellationStatus(tx: any, orderId: number) {
    await tx.orders.update({
      where: { id: orderId },
      data: { status: 'Dibatalkan' }
    });
  }

  private static async fetchOrderWithDetails(orderId: number) {
    return await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: {
          include: {
            product: {
              include: { 
                images: true,
                category: true
              }
            }
          }
        },
        payments: true,
        user: {
          select: { 
            id: true,
            name: true, 
            email: true, 
            phone: true 
          }
        },
        store: true,
        address: true,
        shipping_method: true,
        voucher: true
      }
    });
  }
}