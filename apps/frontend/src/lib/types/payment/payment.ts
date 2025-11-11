// apps/frontend/src/types/payment.ts
export interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  base_cost: number;
  cost_per_km: number;
}

export interface MidtransTransaction {
  token: string;
  redirect_url: string;
}

export interface UploadPaymentRequest {
  orderId: number;
  proofImage: File;
}

export type PaymentMethodType = 'manual_transfer' | 'payment_gateway';