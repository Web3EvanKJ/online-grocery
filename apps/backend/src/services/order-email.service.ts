// services/order-email.service.ts
import { EmailService } from './email.service';
import { AdminOrderService } from './admin-order.service'; // ✅ Import AdminOrderService

export class OrderEmailService {
  static async sendOrderConfirmation(orderId: number) {
    try {
      const order = await this.getOrderDetails(orderId);
      const user = order.user;
      
      await EmailService.sendEmail(
        user.email,
        `Order Confirmation - #${order.id}`,
        this.generateOrderConfirmationTemplate(order)
      );
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  }

  static async sendPaymentProofUploaded(orderId: number) {
    try {
      const order = await this.getOrderDetails(orderId);
      
      await EmailService.sendEmail(
        'admin@store.com', // atau ambil dari env/config
        `Payment Proof Uploaded - Order #${order.id}`,
        this.generatePaymentProofTemplate(order)
      );
    } catch (error) {
      console.error('Failed to send payment notification:', error);
    }
  }

  static async sendOrderCancelled(orderId: number, reason: string) {
    try {
      const order = await this.getOrderDetails(orderId);
      
      await EmailService.sendEmail(
        order.user.email,
        `Order Cancelled - #${order.id}`,
        this.generateCancellationTemplate(order, reason)
      );
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }
  }

  // Tambahkan method-method yang expected oleh EmailService
  static async sendPaymentConfirmation(orderId: number) {
    // Implementation
  }

  static async sendOrderShippedNotification(orderId: number) {
    // Implementation  
  }

  static async sendOrderDeliveredNotification(orderId: number) {
    // Implementation
  }

  static async sendOrderCancellationNotification(orderId: number, reason: string) {
    await this.sendOrderCancelled(orderId, reason);
  }

  private static async getOrderDetails(orderId: number) {
    return await AdminOrderService.getOrderDetails(orderId);
  }

  private static generateOrderConfirmationTemplate(order: any): string {
    return `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order #:</strong> ${order.id}</p>
      <p><strong>Total Amount:</strong> ${order.total_amount}</p>
    `;
  }

  private static generatePaymentProofTemplate(order: any): string {
    return `
      <h1>Payment Proof Uploaded</h1>
      <p>Customer ${order.user.name} has uploaded payment proof for order #${order.id}</p>
    `;
  }

  private static generateCancellationTemplate(order: any, reason: string): string {
    return `
      <h1>Order Cancelled</h1>
      <p>Your order #${order.id} has been cancelled.</p>
      <p><strong>Reason:</strong> ${reason}</p>
    `;
  }
}