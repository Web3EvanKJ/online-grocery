// src/services/voucher.service.ts
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class VoucherService {
  /**
   * Validate voucher code for user and cart
   */
  static async validateVoucher(code: string, userId: number, cartItems: any[], totalAmount: number) {
    if (!code) return { discountAmount: 0, voucher: null };

    const voucher = await prisma.vouchers.findUnique({
      where: { code },
      include: { product: true }
    });

    if (!voucher) throw new Error('Voucher not found');

    if (voucher.expired_at && new Date() > voucher.expired_at) {
      throw new Error('Voucher has expired');
    }

    // If voucher is product-specific, check if cart has the product
    if (voucher.type === 'product' && voucher.product_id) {
      const found = cartItems.find((item) => item.product_id === voucher.product_id);
      if (!found) throw new Error('Voucher not applicable to any product in cart');
    }

    // Calculate discount
    let discountAmount = new Decimal(0);

    if (voucher.discount_type === 'percentage') {
      if (voucher.type === 'product' && voucher.product_id) {
        const item = cartItems.find((i) => i.product_id === voucher.product_id);
        discountAmount = new Decimal(item.price * item.quantity).mul(voucher.discount_value).div(100);
      } else {
        discountAmount = new Decimal(totalAmount).mul(voucher.discount_value).div(100);
      }
    } else if (voucher.discount_type === 'nominal') {
      discountAmount = new Decimal(voucher.discount_value);
    }

    // Apply max_discount if any
    if (voucher.max_discount) {
      discountAmount = Decimal.min(discountAmount, new Decimal(voucher.max_discount));
    }

    return { discountAmount: discountAmount.toNumber(), voucher };
  }
}
