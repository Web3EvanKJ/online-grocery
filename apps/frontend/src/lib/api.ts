import { ApiResponse, PaginationParams, ApiError } from './types/api/api';

const API_BASE =
  `${process.env.NEXT_PUBLIC_API_URL}api/` || 'http://localhost:5000/api';

// Define proper types for API responses
interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: Array<{
      image_url: string;
    }>;
  };
}

interface OrderItem {
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

interface OrderResponse {
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

interface CreateOrderData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  notes?: string;
}

interface MidtransPaymentResponse {
  payment_url?: string;
  token?: string;
  redirect_url?: string;
  status_code?: string;
  transaction_id: string;
}

interface PaymentStatusResponse {
  status: string;
  transaction_id: string;
  order_id: number;
  payment_method: string;
  amount: number;
  [key: string]: unknown;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request<LoginResponse>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string) {
    return this.request<{ message: string }>('auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  // Cart API
  async getCart() {
    return this.request<{ data: CartItem[] }>('cart');
  }

  async addToCart(productId: number, quantity: number) {
    return this.request<{ message: string }>('cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(cartId: number, quantity: number) {
    return this.request<{ message: string }>(`cart/${cartId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartId: number) {
    return this.request<{ message: string }>(`cart/${cartId}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async createOrder(orderData: CreateOrderData) {
    return this.request<{ data: OrderResponse }>('orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request<{ data: OrderResponse[]; pagination: PaginationInfo }>(
      `orders?${queryParams}`
    );
  }

  async getOrderById(orderId: number) {
    return this.request<{ data: OrderResponse }>(`orders/${orderId}`);
  }

  async cancelOrder(orderId: number, reason: string) {
    return this.request<{ message: string }>(`orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Payment API
  async initializeMidtransPayment(orderId: number, paymentMethod: string) {
    return this.request<{ data: MidtransPaymentResponse }>(
      'payments/midtrans/initialize',
      {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          payment_method: paymentMethod,
        }),
      }
    );
  }

  async uploadManualPayment(orderId: number, proofImage: File) {
    const formData = new FormData();
    formData.append('order_id', orderId.toString());
    formData.append('proof_image', proofImage);

    return this.request<{ message: string }>('payments/manual/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Admin API
  async getAdminOrders(params?: PaginationParams & { storeId?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.storeId)
      queryParams.append('storeId', params.storeId.toString());

    return this.request<{ data: OrderResponse[]; pagination: PaginationInfo }>(
      `admin/orders?${queryParams}`
    );
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.request<{ message: string }>(`admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async verifyPayment(orderId: number, isVerified: boolean) {
    return this.request<{ message: string }>(
      `admin/orders/${orderId}/verify-payment`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      }
    );
  }

  // Payment API - tambahkan method ini
  async getPaymentStatus(transactionId: string) {
    return this.request<{ data: PaymentStatusResponse }>(
      `payments/status/${transactionId}`
    );
  }

  async createPayment(paymentData: {
    order_id: number;
    payment_method: string;
  }) {
    return this.request<{ data: MidtransPaymentResponse }>('payments/create', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

export const apiClient = new ApiClient();
