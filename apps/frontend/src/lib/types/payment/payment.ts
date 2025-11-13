// lib/types/payment.ts
export interface PaymentRequest {
  order_id: number;
  payment_method?: string;
  proof_image?: string;
}

export interface MidtransPaymentResponse {
  transaction_id: string;
  payment_url: string;
  status: string;
}

export interface ManualPaymentResponse {
  message: string;
  status: string;
}

export interface PaymentStatusResponse {
  id: number;
  order_id: number;
  method: 'manual_transfer' | 'payment_gateway';
  status: 'pending' | 'verified' | 'failed';
  proof_image?: string;
  transaction_id?: string;
  is_verified: boolean;
  created_at: string;
}