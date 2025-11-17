/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = process.env.NEXT_PUBLIC_API_URL + "api";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") localStorage.setItem("token", token);
  }

  getToken() {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
    return this.token;
  }

  private buildHeaders(isFormData = false) {
    const headers: Record<string, string> = {};
    if (!isFormData) headers["Content-Type"] = "application/json";

    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return headers;
  }

  // ---------- CART ----------
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`, { headers: this.buildHeaders() });
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json(); 
  }

  async addToCart(productId: number, quantity: number) {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
  }

  async updateCart(cartId: number, quantity: number) {
    const res = await fetch(`${API_BASE}/cart/${cartId}`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart");
    return res.json();
  }

  async removeCart(cartId: number) {
    const res = await fetch(`${API_BASE}/cart/${cartId}`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete cart");
    return res.json();
  }

  async clearCart() {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    if (!res.ok) throw new Error("Failed to clear cart");
    return res.json();
  }

  // ---------- ADDRESSES ----------
  async getAddresses() {
    const res = await fetch(`${API_BASE}/addresses`, { headers: this.buildHeaders() });
    if (!res.ok) throw new Error("Failed to fetch addresses");
    const json = await res.json();
    return json.data;
  }

  // ---------- SHIPPING ----------
  async getShippingMethods() {
    const res = await fetch(`${API_BASE}/shipping/methods`, { headers: this.buildHeaders() });
    const json = await res.json();
    return json.data;
  }

  async calculateShippingCost(payload: any) {
    const res = await fetch(`${API_BASE}/shipping/calculate`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json.data;
  }

  // ---------- VOUCHER ----------
  async applyVoucher(code: string, cartItems: any[], totalAmount: number) {
    const res = await fetch(`${API_BASE}/voucher/apply`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ code, cartItems, totalAmount }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to apply voucher");
    return json.data; // { discountAmount: number, type: 'nominal' | 'percentage' }
  }

  async validateVoucher(code: string, userId: number, cartItems: any[], totalAmount: number) {
    const res = await fetch(`${API_BASE}/vouchers/validate`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ code, userId, cartItems, totalAmount }),
    });
    const json = await res.json();
    return json.data; // { voucher: { code, type, value } }
  }

  // ---------- ORDERS ----------
  async createOrder(data: {
    addressId: number;
    shippingMethodId: number;
    voucherCode?: string;
    notes?: string;
    paymentMethod: 'manual_transfer' | 'payment_gateway';
  }) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create order");

    // jika payment_gateway, backend return { paymentUrl }
    return json.data;
  }

  async getOrders(userId: number) {
    const res = await fetch(`${API_BASE}/orders?userId=${userId}&limit=1000`, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    const json = await res.json();
    return json.data;
  }

  async getOrderById(orderId: number) {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    const json = await res.json();
    return json.data;
  }

  async getOrderStatus(orderId: number) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    const json = await res.json();
    return json.data;
  }

  async cancelOrder(orderId: number, reason: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    return json.data;
  }

// Admin orders - fetches ALL orders (no userId needed)
async getAdminOrders(page = 1, limit = 50) {
  const res = await fetch(`${API_BASE}/admin/orders?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: this.buildHeaders(),
  });
  const json = await res.json();
  return json.data;
}

// Admin order details
async getAdminOrderDetails(orderId: number) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
    method: 'GET',
    headers: this.buildHeaders(),
  });
  const json = await res.json();
  return json.data;
}

// Admin update order status
async updateOrderStatus(orderId: number, status: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: this.buildHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update order status');
  return json.data;
}

// Admin verify payment
async verifyPayment(orderId: number, isVerified: boolean) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/verify-payment`, {
    method: 'PATCH',
    headers: this.buildHeaders(),
    body: JSON.stringify({ isVerified }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to verify payment');
  return json.data;
}

// Admin cancel order
async adminCancelOrder(orderId: number, reason: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: this.buildHeaders(),
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to cancel order');
  return json.data;
}

  async confirmOrderDelivery(orderId: number) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/confirm`, {
      method: "PATCH",
      headers: this.buildHeaders(),
    });
    const json = await res.json();
    return json.data;
  }

  // ---------- DISCOUNT ----------
  async getAdminDiscounts() {
    const res = await fetch(`${API_BASE}/admin/discount`, { headers: this.buildHeaders() });
    const json = await res.json();
    return json.data;
  }
  // ---------- PAYMENT ----------
  async initializeMidtransPayment(orderId: number) {
    const res = await fetch(`${API_BASE}/payment/midtrans/initialize`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ order_id: orderId }),
    });
    const json = await res.json();
    return json.data; // { transaction_id, payment_url, status }
  }

  async uploadManualPayment(orderId: number, file: File) {
    const formData = new FormData();
    formData.append('order_id', orderId.toString());
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/payment/manual/upload`, {
      method: 'POST',
      headers: this.buildHeaders(true), // FormData
      body: formData,
    });
    const json = await res.json();
    
    if (!json.success) {
      throw new Error(json.error || 'Upload failed');
    }

    return json.data; // { message, status }
  }

  async getPaymentStatus(orderId: number) {
    const res = await fetch(`${API_BASE}/payment/status/${orderId}`, {
      headers: this.buildHeaders(),
    });
    const json = await res.json();
    return json.data; // payment info
  }

}

export const apiClient = new ApiClient();
