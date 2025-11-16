// lib/types/payment.ts
export interface PaymentRequest {
  order_id: number;
  payment_method?: string;
  proof_image?: string;
}

export interface MidtransPaymentResponse {
  payment_url?: string;
  token?: string;
  redirect_url?: string;
  status_code?: string;
  transaction_id: string;
}

export interface ManualPaymentResponse {
  message: string;
  status: string;
}

export interface PaymentStatusResponse {
  status: string;
  transaction_id: string;
  order_id: number;
  payment_method: string;
  amount: number;
  [key: string]: unknown;
}