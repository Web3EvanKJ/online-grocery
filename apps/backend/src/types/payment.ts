export interface PaymentResponse {
  id: number;
  order_id: number;
  method: 'manual_transfer' | 'payment_gateway';
  status: 'pending' | 'verified' | 'failed';
  proof_image?: string;
  transaction_id?: string;
  is_verified: boolean;
  created_at: Date;
}

export type MidtransPaymentRequest = {
  order_id: number;
  payment_method: 'gopay' | 'bank_transfer' | 'credit_card'
}

export interface ManualPaymentRequest {
  order_id: number;
  proof_image: string; // Base64 or Cloudinary URL
}

export interface MidtransTransaction {
  transaction_id: string;
  order_id: number;
  gross_amount: number;
  payment_type: string;
  transaction_status: string;
  payment_url?: string;
}