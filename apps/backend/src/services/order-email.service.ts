// src/services/order-email.service.ts
import { prisma } from '../utils/prisma';
import { EmailSenderService } from './email-sender.service';
import { EmailTemplatesService } from './email-template.service';

export class OrderEmailService {
  static async sendOrderConfirmation(orderId: number) {
    try {
      const order = await this.getOrderWithDetails(orderId);
      if (!order) return;

      const subject = `Order Confirmation - #${order.id}`;
      const html = EmailTemplatesService.generateOrderConfirmationHTML(order);

      await EmailSenderService.sendEmail(order.user.email, subject, html);
      console.log(`Order confirmation email sent for order #${order.id}`);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }
  }

  static async sendPaymentConfirmation(orderId: number) {
    try {
      const order = await this.getOrderWithUser(orderId);
      if (!order) return;

      const subject = `Payment Confirmed - Order #${order.id}`;
      const html = EmailTemplatesService.generatePaymentConfirmationHTML(order);

      await EmailSenderService.sendEmail(order.user.email, subject, html);
      console.log(`Payment confirmation email sent for order #${order.id}`);
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
    }
  }

  static async sendOrderShippedNotification(orderId: number, trackingNumber?: string) {
    try {
      const order = await this.getOrderWithShippingDetails(orderId);
      if (!order) return;

      const subject = `Your Order Has Been Shipped - #${order.id}`;
      const html = EmailTemplatesService.generateOrderShippedHTML(order, trackingNumber);

      await EmailSenderService.sendEmail(order.user.email, subject, html);
      console.log(`Order shipped notification sent for order #${order.id}`);
    } catch (error) {
      console.error('Failed to send order shipped notification:', error);
    }
  }

  static async sendOrderDeliveredNotification(orderId: number) {
    try {
      const order = await this.getOrderWithUser(orderId);
      if (!order) return;

      const subject = `Order Delivered - #${order.id}`;
      const html = EmailTemplatesService.generateOrderDeliveredHTML(order);

      await EmailSenderService.sendEmail(order.user.email, subject, html);
      console.log(`Order delivered notification sent for order #${order.id}`);
    } catch (error) {
      console.error('Failed to send order delivered notification:', error);
    }
  }

  static async sendOrderCancellationNotification(orderId: number, reason: string) {
    try {
      const order = await this.getOrderWithUser(orderId);
      if (!order) return;

      const subject = `Order Cancelled - #${order.id}`;
      const html = EmailTemplatesService.generateOrderCancellationHTML(order, reason);

      await EmailSenderService.sendEmail(order.user.email, subject, html);
      console.log(`Order cancellation notification sent for order #${order.id}`);
    } catch (error) {
      console.error('Failed to send order cancellation notification:', error);
    }
  }

  private static async getOrderWithDetails(orderId: number) {
    return await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        store: true,
        address: true,
        order_items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  private static async getOrderWithUser(orderId: number) {
    return await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payments: true
      }
    });
  }

  private static async getOrderWithShippingDetails(orderId: number) {
    return await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        store: true,
        shipping_method: true
      }
    });
  }
}