// src/services/payment.service.ts
import { prisma } from '../utils/prisma';
import { v2 as cloudinary } from 'cloudinary';
import midtransClient from 'midtrans-client';
import { AuthUser } from '../types/express';
import { EmailService } from './email.service';

export class PaymentService {
  private static snap: midtransClient.Snap;

  static initializeMidtrans() {
    this.snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!
    });
  }

  static async uploadPaymentProof(orderId: number, imageBuffer: Buffer) {
    const order = await this.validateOrderForPayment(orderId);

    const imageUrl = await this.uploadToCloudinary(imageBuffer);
    
    await this.updatePaymentRecord(orderId, imageUrl);
    
    await this.updateOrderStatus(orderId, 'Menunggu_Konfirmasi_Pembayaran');

    return { message: 'Payment proof uploaded successfully' };
  }

  private static async validateOrderForPayment(orderId: number) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, status: 'Menunggu_Pembayaran' },
      include: { payments: true }
    });

    if (!order) {
      throw new Error('Order not found or cannot upload payment');
    }

    return order;
  }

  private static async uploadToCloudinary(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'payment-proofs'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        )
        .end(imageBuffer);
    });
  }

  private static async updatePaymentRecord(orderId: number, imageUrl: string) {
    await prisma.payments.updateMany({
      where: { order_id: orderId },
      data: { proof_image: imageUrl }
    });
  }

  private static async updateOrderStatus(orderId: number, status: string) {
    await prisma.orders.update({
      where: { id: orderId },
      data: { status: status as any }
    });
  }

  static async createMidtransTransaction(orderId: number, user: AuthUser) {
    const order = await this.getOrderWithUser(orderId, user.id);

    const parameter = this.createMidtransParameter(order, user);

    const transaction = await this.snap.createTransaction(parameter);
    
    await this.updatePaymentTransactionId(orderId, parameter.transaction_details.order_id);

    return transaction;
  }

  private static async getOrderWithUser(orderId: number, userId: number) {
    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: { user: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  private static createMidtransParameter(order: any, user: AuthUser) {
    return {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: Number(order.total_amount)
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || ''
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/orders/${order.id}/success`,
        error: `${process.env.FRONTEND_URL}/orders/${order.id}/error`,
        pending: `${process.env.FRONTEND_URL}/orders/${order.id}/pending`
      }
    };
  }

  private static async updatePaymentTransactionId(orderId: number, transactionId: string) {
    await prisma.payments.updateMany({
      where: { order_id: orderId },
      data: { transaction_id: transactionId }
    });
  }

  static async handleMidtransNotification(payload: any) {
    const orderId = this.extractOrderId(payload.order_id);
    
    await this.processPaymentStatus(orderId, payload.transaction_status);
  }

  private static extractOrderId(midtransOrderId: string): number {
    return parseInt(midtransOrderId.split('-')[1]);
  }

  private static async processPaymentStatus(orderId: number, status: string) {
    const statusMap: { [key: string]: string } = {
      'settlement': 'Menunggu_Konfirmasi_Pembayaran',
      'capture': 'Menunggu_Konfirmasi_Pembayaran',
      'cancel': 'Dibatalkan',
      'expire': 'Dibatalkan',
      'deny': 'Dibatalkan'
    };

    const newStatus = statusMap[status];
    
    if (newStatus) {
      await this.updateOrderAndPayment(orderId, newStatus, status === 'settlement');
      
      // Send email notifications
      if (status === 'settlement') {
        await EmailService.sendPaymentConfirmation(orderId);
      } else if (status === 'cancel' || status === 'expire') {
        await EmailService.sendOrderCancellationNotification(
          orderId, 
          `Payment ${status}`
        );
      }
    }
  }

  private static async updateOrderAndPayment(orderId: number, status: string, isVerified: boolean) {
    await prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { status: status as any }
      });

      await tx.payments.updateMany({
        where: { order_id: orderId },
        data: { is_verified: isVerified }
      });
    });
  }
}