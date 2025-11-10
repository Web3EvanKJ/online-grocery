export interface PaymentProofRequest {
  orderId: number;
  image: File;
}

export interface MidtransTransactionRequest {
  orderId: number;
}

export interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransNotification {
  transaction_status: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  signature_key: string;
  status_code: string;
}