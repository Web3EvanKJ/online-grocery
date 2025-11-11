// apps/frontend/src/lib/api.ts
import { AddToCartRequest, CartResponse } from '@/lib/types/cart/cart';
import { Order, CreateOrderRequest, OrdersResponse } from '@/lib/types/order/order';
import { PaymentMethod, MidtransTransaction, UploadPaymentRequest } from '@/lib/types/payment/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchWithFormData(url: string, formData: FormData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Cart APIs
  async getCart(): Promise<CartResponse> {
    return this.fetchWithAuth('/cart');
  }

  async addToCart(data: AddToCartRequest): Promise<CartResponse> {
    return this.fetchWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(cartId: number, quantity: number): Promise<CartResponse> {
    return this.fetchWithAuth(`/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartId: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`/cart/${cartId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth('/cart', {
      method: 'DELETE',
    });
  }

  // Order APIs
  async createOrder(data: CreateOrderRequest): Promise<{ success: boolean; message: string; data: Order }> {
    return this.fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    return this.fetchWithAuth(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(orderId: number): Promise<{ success: boolean; message: string; data: Order }> {
    return this.fetchWithAuth(`/orders/${orderId}`);
  }

  async cancelOrder(orderId: number, reason: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async confirmOrder(orderId: number): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`/orders/${orderId}/confirm`, {
      method: 'POST',
    });
  }

  // Payment APIs
  async getShippingMethods(): Promise<{ success: boolean; message: string; data: PaymentMethod[] }> {
    return this.fetchWithAuth('/shipping/methods');
  }

  async createMidtransTransaction(orderId: number): Promise<{ success: boolean; message: string; data: MidtransTransaction }> {
    return this.fetchWithAuth('/payments/create-transaction', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async uploadPaymentProof(data: UploadPaymentRequest): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('orderId', data.orderId.toString());
    formData.append('proofImage', data.proofImage);
    
    return this.fetchWithFormData('/payments/upload-proof', formData);
  }
}

export const apiClient = new ApiClient();