// lib/types/order.ts
export interface CreateOrderData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  notes?: string;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  shipping_method_id: number;
  status: string;
  total_amount: number;
  shipping_cost: number;
  discount_amount?: number;
  created_at: string;
  updated_at: string;
  address?: {
    id: number;
    user_id: number;
    label: string;
    address_detail: string;
    province: string;
    city: string;
    district: string;
    subdistrict: string;
    postal_code: string;
    is_main: boolean;
    created_at: string;
    updated_at: string;
  };
  shipping_method?: {
    id: number;
    name: string;
    provider: string;
    base_cost: number;
    cost_per_km: number;
    created_at: string;
    updated_at: string;
  };
  store?: {
    id: number;
    name: string;
    description?: string;
    address: string;
    province: string;
    city: string;
    district: string;
    subdistrict: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
    updated_at: string;
  };
  order_items: OrderItem[];
  payments: Array<{
    id: number;
    order_id: number;
    method: string;
    amount: number;
    status: string;
    transaction_id: string;
    proof_image?: string;
    is_verified: boolean;
    verified_at?: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  discount?: number;
  product: {
    id: number;
    name: string;
    images: Array<{
      image_url: string;
    }>;
  };
}

export interface PaymentResponse {
  id: number;
  transaction_id: string;
  method: string;
  is_verified: boolean;
  proof_image?: string;
}

export interface StoreInfo {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  subdistrict: string;
  province: string;
}

export interface AddressInfo {
  id: number;
  label: string;
  address_detail: string;
  province: string;
  city: string;
  subdistrict: string;
  district: string;
}

export interface ShippingMethodInfo {
  id: number;
  name: string;
  provider: string;
  base_cost: number;
}