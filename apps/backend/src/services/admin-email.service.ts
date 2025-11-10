// src/services/admin-email.service.ts
import { prisma } from '../utils/prisma';
import { EmailSenderService } from './email-sender.service';
import { EmailTemplatesService } from './email-template.service';

export class AdminEmailService {
  static async sendNewOrderNotification(orderId: number) {
    try {
      const order = await this.getOrderWithStoreDetails(orderId);
      if (!order) return;

      const adminEmails = await this.getStoreAdminEmails(order.store_id);
      
      for (const email of adminEmails) {
        await this.sendAdminNotification(email, order);
      }

      console.log(`New order notifications sent for order #${orderId}`);
    } catch (error) {
      console.error('Failed to send admin notifications:', error);
    }
  }

  private static async getOrderWithStoreDetails(orderId: number) {
    return await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        order_items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  private static async getStoreAdminEmails(storeId: number): Promise<string[]> {
    const adminUsers = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'super_admin' },
          { 
            role: 'store_admin',
            store_admins: {
              some: {
                store_id: storeId
              }
            }
          }
        ]
      },
      select: {
        email: true
      }
    });

    return adminUsers.map(user => user.email);
  }

  private static async sendAdminNotification(adminEmail: string, order: any) {
    const subject = `New Order Received - #${order.id}`;
    const html = EmailTemplatesService.generateAdminNotificationHTML(order);

    try {
      await EmailSenderService.sendEmail(adminEmail, subject, html);
    } catch (error) {
      console.error(`Failed to send email to admin ${adminEmail}:`, error);
    }
  }
}