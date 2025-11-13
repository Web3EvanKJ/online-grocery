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

export interface MidtransPaymentRequest {
  order_id: number;
  payment_method: string; // 'gopay', 'shopeepay', 'bank_transfer', etc.
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