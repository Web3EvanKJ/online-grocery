// services/payment.service.ts
import { prisma } from '../utils/prisma';
import { MidtransPaymentRequest, ManualPaymentRequest } from '../types/payment';
import midtransClient from 'midtrans-client';

export class PaymentService {
  static midtransCoreApi: midtransClient.CoreApi;

  // Init Midtrans CoreApi (optional, bisa dipakai untuk charge/query)
  static initMidtrans() {
    if (!this.midtransCoreApi) {
      this.midtransCoreApi = new midtransClient.CoreApi({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY!,
        clientKey: process.env.MIDTRANS_CLIENT_KEY!,
      });
    }
    return this.midtransCoreApi;
  }

  // Initialize Midtrans Payment (Snap)
  static async initializeMidtransPayment(data: MidtransPaymentRequest) {
    if (!data.order_id) throw new Error('order_id is required');
    if (!data.payment_method) throw new Error('payment_method is required');

    const order = await prisma.orders.findUnique({
      where: { id: data.order_id },
      include: { user: true },
    });
    if (!order) throw new Error('Order not found');

    // Gunakan Snap API
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    // Build transaction payload
    const parameter: any = {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: Number(order.total_amount),
      },
      customer_details: {
        first_name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || '08123456789',
      },
    };

    // Tentukan payment_type untuk Midtrans
    switch (data.payment_method) {
      case 'gopay':
        parameter.payment_type = 'gopay';
        break;
      case 'bank_transfer':
        parameter.payment_type = 'bank_transfer';
        parameter.bank_transfer = { bank: 'bca' };
        break;
      case 'credit_card':
        parameter.payment_type = 'credit_card';
        parameter.credit_card = { secure: true };
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    // Create transaction di Midtrans Snap
    const snapResponse = await snap.createTransaction(parameter);

    // Simpan di DB, enum Prisma tetap aman
    await prisma.payments.updateMany({
      where: { order_id: order.id },
      data: {
        method: 'payment_gateway', // semua non-manual disimpan sebagai payment_gateway
        transaction_id: snapResponse.token,
        is_verified: false,
      },
    });

    return {
      transactionId: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
    };
  }

  // Upload Manual Payment
  static async uploadManualPayment(data: ManualPaymentRequest) {
    if (!data.order_id || !data.proof_image) throw new Error('Missing required fields');

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

  // Get Payment Status
  static async getPaymentStatus(orderId: number) {
    const payment = await prisma.payments.findFirst({ where: { order_id: orderId } });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  // Handle Midtrans Webhook
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

      await prisma.payments.update({
        where: { id: payment.id },
        data: { is_verified: true },
      });

      await prisma.orders.update({
        where: { id: payment.order_id },
        data: { status: 'Diproses' },
      });

      console.log('Order status updated to Diproses for order_id:', payment.order_id);
    }

    return { received: true };
  }

  // Admin Verify Manual Payment
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
