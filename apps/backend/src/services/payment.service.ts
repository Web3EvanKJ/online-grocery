// services/payment.service.ts
import { prisma } from '../utils/prisma';
import { MidtransPaymentRequest, ManualPaymentRequest } from '../types/payment';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  // Inisialisasi pembayaran via Midtrans (mock)
  static async initializeMidtransPayment(data: MidtransPaymentRequest) {
    if (!data.order_id) throw new Error('order_id is required');

    const order = await prisma.orders.findUnique({
      where: { id: data.order_id },
      include: { user: true },
    });

    if (!order) throw new Error('Order not found');

    // Generate unique transaction_id menggunakan UUID
    const transaction_id = `mt-${uuidv4()}`;

    // Mock Midtrans response
    const mockResponse = {
      transaction_id,
      payment_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/mock-payment',
      status: 'pending',
    };

    // Update payment record
    await prisma.payments.updateMany({
      where: { order_id: data.order_id },
      data: {
        method: 'payment_gateway',
        transaction_id,
        is_verified: false,
      },
    });

    return mockResponse;
  }

  // Upload bukti pembayaran manual
  static async uploadManualPayment(data: ManualPaymentRequest) {
    if (!data.order_id) throw new Error('order_id is required');
    if (!data.proof_image) throw new Error('proof_image is required');

    const order = await prisma.orders.findUnique({ where: { id: data.order_id } });
    if (!order) throw new Error('Order not found');

    await prisma.payments.updateMany({
      where: { order_id: data.order_id },
      data: {
        method: 'manual_transfer',
        proof_image: data.proof_image,
        is_verified: false,
      },
    });

    await prisma.orders.update({
      where: { id: data.order_id },
      data: { status: 'Menunggu_Konfirmasi_Pembayaran' },
    });

    return { message: 'Payment proof uploaded successfully', status: 'pending_verification' };
  }

  // Ambil status pembayaran
  static async getPaymentStatus(orderId: number) {
    if (!orderId) throw new Error('orderId is required');

    const payment = await prisma.payments.findFirst({ where: { order_id: orderId } });
    if (!payment) throw new Error('Payment not found');

    return payment;
  }

  // Webhook Midtrans untuk update status otomatis
  static async handleMidtransWebhook(payload: any) {
    console.log('Midtrans webhook received:', payload);

    if (payload.transaction_status === 'settlement') {
      const payment = await prisma.payments.findFirst({
        where: { transaction_id: payload.transaction_id },
      });

      if (!payment) {
        console.error('Payment not found for transaction_id:', payload.transaction_id);
        return { received: false };
      }

      // Update payment verified
      await prisma.payments.update({
        where: { id: payment.id },
        data: { is_verified: true },
      });

      // Update order status otomatis ke Diproses
      await prisma.orders.update({
        where: { id: payment.order_id },
        data: { status: 'Diproses' },
      });

      console.log('Order status updated to Diproses for order_id:', payment.order_id);
    }

    return { received: true };
  }

  // Admin verify manual payment
  static async verifyManualPayment(orderId: number, adminId: number, isVerified: boolean) {
    const payment = await prisma.payments.findFirst({ where: { order_id: orderId } });
    if (!payment) throw new Error('Payment not found');

    await prisma.payments.updateMany({
      where: { order_id: orderId },
      data: { is_verified: isVerified, verified_by: adminId },
    });

    await prisma.orders.update({
      where: { id: orderId },
      data: { status: isVerified ? 'Diproses' : 'Dibatalkan' },
    });

    return { message: isVerified ? 'Payment verified successfully' : 'Payment rejected' };
  }
}
