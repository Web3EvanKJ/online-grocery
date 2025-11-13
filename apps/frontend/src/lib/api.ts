import { ApiResponse, PaginationParams, ApiError } from './types/api/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  // lib/api.ts
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
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  // Cart API
  async getCart() {
    return this.request<{ data: any[] }>('/cart');
  }

  async addToCart(productId: number, quantity: number) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(cartId: number, quantity: number) {
    return this.request(`/cart/${cartId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartId: number) {
    return this.request(`/cart/${cartId}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async createOrder(orderData: any) {
    return this.request<{ data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request<{ data: any[]; pagination: any }>(`/orders?${queryParams}`);
  }

  async getOrderById(orderId: number) {
    return this.request<{ data: any }>(`/orders/${orderId}`);
  }

  async cancelOrder(orderId: number, reason: string) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Payment API
  async initializeMidtransPayment(orderId: number, paymentMethod: string) {
    return this.request<{ data: any }>('/payments/midtrans/initialize', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, payment_method: paymentMethod }),
    });
  }

  async uploadManualPayment(orderId: number, proofImage: File) {
    const formData = new FormData();
    formData.append('order_id', orderId.toString());
    formData.append('proof_image', proofImage);

    return this.request('/payments/manual/upload', {
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
    if (params?.storeId) queryParams.append('storeId', params.storeId.toString());
    
    return this.request<{ data: any[]; pagination: any }>(`/admin/orders?${queryParams}`);
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async verifyPayment(orderId: number, isVerified: boolean) {
    return this.request(`/admin/orders/${orderId}/verify-payment`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  }

  // Payment API - tambahkan method ini
  async getPaymentStatus(transactionId: string) {
    return this.request<{ data: any }>(`/payments/status/${transactionId}`);
  }

  async createPayment(paymentData: any) {
    return this.request<{ data: any }>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

export const apiClient = new ApiClient();