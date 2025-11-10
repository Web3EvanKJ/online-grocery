// src/types/discount.ts
export interface DiscountCalculation {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountType: 'product' | 'voucher' | 'shipping';
}

export interface VoucherValidation {
  isValid: boolean;
  discountValue: number;
  maxDiscount?: number;
  message?: string;
}