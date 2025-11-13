// services/payment.service.ts
import { prisma } from '../utils/prisma';
import { MidtransPaymentRequest, ManualPaymentRequest } from '../types/payment';

export class PaymentService {
  // ✅ Method name harus match dengan yang dipanggil di controller
  static async initializeMidtransPayment(data: MidtransPaymentRequest) {
    const order = await prisma.orders.findUnique({
      where: { id: data.order_id },
      include: { user: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Mock Midtrans response
    const mockResponse = {
      transaction_id: `mt-${Date.now()}`,
      payment_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/mock-payment',
      status: 'pending'
    };

    // Update payment record
    await prisma.payments.updateMany({
      where: { order_id: data.order_id },
      data: {
        method: 'payment_gateway',
        transaction_id: mockResponse.transaction_id
      }
    });

    return mockResponse;
  }

  static async uploadManualPayment(data: ManualPaymentRequest) {
    const order = await prisma.orders.findUnique({
      where: { id: data.order_id }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update payment record
    await prisma.payments.updateMany({
      where: { order_id: data.order_id },
      data: {
        method: 'manual_transfer',
        proof_image: data.proof_image,
        is_verified: false
      }
    });

    return { message: 'Payment proof uploaded successfully', status: 'pending_verification' };
  }

  static async getPaymentStatus(orderId: number) {
    const payment = await prisma.payments.findFirst({
      where: { order_id: orderId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  static async handleMidtransWebhook(payload: any) {
    console.log('Midtrans webhook received:', payload);
    
    if (payload.transaction_status === 'settlement') {
      await prisma.payments.updateMany({
        where: { transaction_id: payload.transaction_id },
        data: { is_verified: true }
      });

      await prisma.orders.update({
        where: { id: parseInt(payload.order_id) },
        data: { status: 'Menunggu_Konfirmasi_Pembayaran' }
      });
    }

    return { received: true };
  }
}