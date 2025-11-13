// src/services/email.service.ts
import { EmailSenderService } from './email-sender.service';
import { OrderEmailService } from './order-email.service';
import { AdminEmailService } from './admin-email.service';

export class EmailService {
  static initializeTransporter() {
    EmailSenderService.initializeTransporter();
  }

  static async testEmail() {
    return await EmailSenderService.testConnection();
  }

  // Order-related emails
  static async sendOrderConfirmation(orderId: number) {
    await OrderEmailService.sendOrderConfirmation(orderId);
  }

  static async sendPaymentConfirmation(orderId: number) {
    await OrderEmailService.sendPaymentConfirmation(orderId);
  }

  static async sendOrderShippedNotification(orderId: number) {
    await OrderEmailService.sendOrderShippedNotification(orderId);
  }

  static async sendOrderDeliveredNotification(orderId: number) {
    await OrderEmailService.sendOrderDeliveredNotification(orderId);
  }

  static async sendOrderCancellationNotification(orderId: number, reason: string) {
    await OrderEmailService.sendOrderCancellationNotification(orderId, reason);
  }

  // Admin emails
  static async sendNewOrderNotification(orderId: number) {
    return await AdminEmailService.sendNewOrderNotification(orderId);
  }

  // Direct email sending (for custom emails)
  static async sendEmail(to: string, subject: string, html: string) {
    return await EmailSenderService.sendEmail(to, subject, html);
  }
}