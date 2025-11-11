export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    images: Array<{
      id: number;
      image_url: string;
    }>;
  };
  quantity: number;
  price: number;
  discount?: number;
}

export interface Order {
  id: number;
  user_id: number;
  store_id: number;
  address_id: number;
  voucher_id?: number;
  shipping_method_id: number;
  total_amount: number;
  shipping_cost: number;
  discount_amount?: number;
  status: 'Menunggu_Pembayaran' | 'Menunggu_Konfirmasi_Pembayaran' | 'Diproses' | 'Dikirim' | 'Pesanan_Dikonfirmasi' | 'Dibatalkan';
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  store: {
    id: number;
    name: string;
    address: string;
  };
  address: {
    id: number;
    label: string;
    address_detail: string;
    province: string;
    city: string;
    district: string;
  };
  shipping_method: {
    id: number;
    name: string;
    provider: string;
  };
  payments: Array<{
    id: number;
    method: string;
    proof_image?: string;
    is_verified: boolean;
    created_at: string;
  }>;
}

export interface CreateOrderRequest {
  addressId: number;
  shippingMethodId: number;
  voucherCode?: string;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}