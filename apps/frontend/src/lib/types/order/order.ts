/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CreateOrderData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  notes?: string;
  payment_method?: string;
}
export interface CreateOrderRequest {
  addressId: number;
  shippingMethodId: number;
  voucherCode?: string;
  notes?: string;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
}

export interface OrderResponse {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  shipping_method_id: number;
  voucher_id?: number;
  total_amount: number;
  shipping_cost: number;
  discount_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  order_items: any[];
  payments: any[];
  address: any;
  shipping_method: any;
  store: any;
  paymentUrl?:string;
}