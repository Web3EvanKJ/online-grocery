import { prisma } from '../utils/prisma';
import { OrderEmailService } from './order-email.service';

export class AutoCancellationService {
  static async cancelUnpaidOrders() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const unpaidOrders = await prisma.orders.findMany({
        where: {
          status: 'Menunggu_Pembayaran',
          created_at: { lt: oneHourAgo },
          payments: {
            every: {
              is_verified: false,
              proof_image: null
            }
          }
        },
        include: {
          order_items: true,
          user: true
        }
      });

      for (const order of unpaidOrders) {
        await this.cancelOrderAutomatically(order);
      }

      console.log(`Auto-cancelled ${unpaidOrders.length} unpaid orders`);
    } catch (error) {
      console.error('Auto-cancellation failed:', error);
    }
  }

  private static async cancelOrderAutomatically(order: any) {
    await prisma.$transaction(async (tx) => {
      // Return stock
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
              note: `Auto-cancelled: Order #${order.id} - Unpaid`
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

    // Send cancellation email
    await OrderEmailService.sendOrderCancelled(
      order.id, 
      'Automatic cancellation due to unpaid order'
    );
  }
}