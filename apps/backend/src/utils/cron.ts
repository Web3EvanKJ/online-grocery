// src/utils/cron.ts
import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import dayjs from 'dayjs';

export const setupCronJobs = () => {
//   this.scheduleAutoCancelOrders();
//   this.scheduleAutoConfirmOrders();
//   this.scheduleCleanupExpiredCarts();
  scheduleAutoCancelOrders();
  scheduleAutoConfirmOrders();
  scheduleCleanupExpiredCarts();
};

const scheduleAutoCancelOrders = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await autoCancelUnpaidOrders();
    } catch (error) {
      console.error('Error in auto-cancel cron job:', error);
    }
  });
};

const scheduleAutoConfirmOrders = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await autoConfirmDeliveredOrders();
    } catch (error) {
      console.error('Error in auto-confirm cron job:', error);
    }
  });
};

const scheduleCleanupExpiredCarts = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupExpiredCarts();
    } catch (error) {
      console.error('Error in cart cleanup cron job:', error);
    }
  });
};

const autoCancelUnpaidOrders = async () => {
  const oneHourAgo = dayjs().subtract(1, 'hour').toDate();
  
  const unpaidOrders = await prisma.orders.findMany({
    where: {
      status: 'Menunggu_Pembayaran',
      created_at: { lte: oneHourAgo },
      payments: {
        every: {
          is_verified: false,
          proof_image: null
        }
      }
    },
    include: {
      order_items: true
    }
  });

  for (const order of unpaidOrders) {
    await cancelOrderAndRestoreStock(order);
  }

  console.log(`Auto-cancelled ${unpaidOrders.length} unpaid orders`);
};

const cancelOrderAndRestoreStock = async (order: any) => {
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
            note: `Auto cancellation - Order #${order.id}`
          }
        });
      }
    }

    await tx.orders.update({
      where: { id: order.id },
      data: { status: 'Dibatalkan' }
    });
  });
};

const autoConfirmDeliveredOrders = async () => {
  const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();
  
  await prisma.orders.updateMany({
    where: {
      status: 'Dikirim',
      updated_at: { lte: sevenDaysAgo }
    },
    data: { status: 'Pesanan_Dikonfirmasi' }
  });

  console.log('Auto-confirmed delivered orders');
};

const cleanupExpiredCarts = async () => {
  const thirtyDaysAgo = dayjs().subtract(30, 'days').toDate();
  
  await prisma.carts.deleteMany({
    where: {
      updated_at: { lte: thirtyDaysAgo }
    }
  });

  console.log('Cleaned up expired carts');
};