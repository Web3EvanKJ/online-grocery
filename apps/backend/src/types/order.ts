export interface CreateOrderRequest {
  addressId: number;
  shippingMethodId: number;
  voucherCode?: string;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  price: number;
  discount?: number;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  voucher_id?: number;
  shipping_method_id: number;
  total_amount: number;
  shipping_cost: number;
  discount_amount?: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  order_items: OrderItemResponse[];
  store: Store;
  address: Address;
  shipping_method: ShippingMethod;
  payments: Payment[];
}

export interface OrderItemResponse {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Product {
  id: number;
  name: string;
  images: ProductImage[];
}

export interface Address {
  id: number;
  label: string;
  address_detail: string;
  province: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
  base_cost: number;
  cost_per_km: number;
}

export interface Payment {
  id: number;
  method: string;
  proof_image?: string;
  is_verified: boolean;
  created_at: Date;
}