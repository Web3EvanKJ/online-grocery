// src/utils/discount.ts
import { DiscountCalculation, VoucherValidation } from '../types/discount';

export class DiscountService {
  static calculateProductDiscount(
    originalPrice: number,
    discountValue: number,
    discountType: 'percentage' | 'nominal'
  ): DiscountCalculation {
    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = originalPrice * (discountValue / 100);
    } else {
      discountAmount = Math.min(discountValue, originalPrice);
    }

    const finalPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      discountAmount,
      finalPrice,
      discountType: 'product'
    };
  }

  static calculateVoucherDiscount(
    totalAmount: number,
    voucher: any
  ): VoucherValidation {
    if (!voucher) {
      return { isValid: false, discountValue: 0, message: 'Voucher not found' };
    }

    if (voucher.expired_at && new Date() > voucher.expired_at) {
      return { isValid: false, discountValue: 0, message: 'Voucher has expired' };
    }

    let discountValue = 0;

    if (voucher.discount_type === 'percentage') {
      discountValue = totalAmount * (Number(voucher.discount_value) / 100);
      
      if (voucher.max_discount && discountValue > Number(voucher.max_discount)) {
        discountValue = Number(voucher.max_discount);
      }
    } else {
      discountValue = Number(voucher.discount_value);
    }

    // Check if discount exceeds total amount
    if (discountValue > totalAmount) {
      discountValue = totalAmount;
    }

    return {
      isValid: true,
      discountValue,
      maxDiscount: voucher.max_discount ? Number(voucher.max_discount) : undefined
    };
  }

  static validateB1G1Discount(
    productId: number,
    quantity: number,
    discounts: any[]
  ): number {
    const b1g1Discount = discounts.find(
      d => d.type === 'b1g1' && d.product_id === productId
    );

    if (!b1g1Discount) {
      return 0;
    }

    // For B1G1, every 2 items get 1 free
    const freeItems = Math.floor(quantity / 2);
    return freeItems * Number(b1g1Discount.product?.price || 0);
  }
}