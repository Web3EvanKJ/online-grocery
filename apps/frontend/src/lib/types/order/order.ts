// lib/types/order.ts
export interface CreateOrderRequest {
  addressId: number;
  shippingMethodId: number;
  voucherCode?: string;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
}

export interface OrderResponse {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  shipping_method_id: number;
  total_amount: number;
  shipping_cost: number;
  discount_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItemResponse[];
  payments: PaymentResponse[];
  store?: StoreInfo;
  address?: AddressInfo;
  shipping_method?: ShippingMethodInfo;
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: { image_url: string }[];
  };
}

export interface PaymentResponse {
  id: number;
  method: string;
  is_verified: boolean;
  proof_image?: string;
}

export interface StoreInfo {
  id: number;
  name: string;
  address: string;
  city: string;
}

export interface AddressInfo {
  id: number;
  label: string;
  address_detail: string;
  province: string;
  city: string;
  district: string;
}

export interface ShippingMethodInfo {
  id: number;
  name: string;
  provider: string;
  base_cost: number;
}