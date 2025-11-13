export interface CreateOrderRequest {
  addressId: number;
  shippingMethodId: number;
  voucherCode?: string;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
}

// Use any for Decimal fields to avoid type issues
export interface OrderResponse {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  shipping_method_id: number;
  total_amount: any; // Use any to accept Decimal
  shipping_cost: any;
  discount_amount: any;
  status: string;
  created_at: Date;
  order_items: OrderItemResponse[];
  payments: PaymentResponse[];
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: any; // Use any for Decimal
  product: {
    name: string;
    images: { image_url: string }[];
  };
}

export interface PaymentResponse {
  id: number;
  method: string;
  is_verified: boolean;
}