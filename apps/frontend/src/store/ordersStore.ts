// apps/frontend/src/store/ordersStore.ts
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { CreateOrderRequest, OrderResponse } from "@/lib/types/order/order";

interface OrdersState {
  orders: any[];
  orderDetails: any | null;
  orderStatus: any | null;

  loading: boolean;
  error: string | null;

  // ===== METHODS =====
  createOrder: (data: CreateOrderRequest) => Promise<OrderResponse>;
  getOrders: (page?: number, limit?: number) => Promise<void>;
  getOrderById: (orderId: number) => Promise<void>;
  cancelOrder: (orderId: number, reason: string) => Promise<void>;
  confirmOrderDelivery: (orderId: number) => Promise<void>;
  getOrderStatus: (orderId: number) => Promise<void>;

  clearOrderDetails: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  orderDetails: null,
  orderStatus: null,

  loading: false,
  error: null,

  // ===========================
  // CREATE ORDER (CHECKOUT)
  // ===========================
  createOrder: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await apiClient.createOrder(data);
      set({ orderDetails: res });

      return res;
    } catch (err: any) {
      set({ error: err?.message || "Failed to create order" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Tambahkan method updateOrderStatus untuk admin
    updateOrderStatus: async (orderId: number, status: 'pending' | 'verified' | 'cancelled') => {
      try {
        set({ loading: true, error: null });

        await apiClient.updateOrderStatus(orderId, status);

    // Refresh order details
    await get().getOrderById(orderId);
  } catch (err: any) {
    set({ error: err?.message || 'Failed to update order status' });
    throw err;
  } finally {
    set({ loading: false });
  }
},


  // ===========================
  // GET ORDERS
  // ===========================
   getOrders: async () => {
    try {
      set({ loading: true, error: null });
      const userId = Number(localStorage.getItem('userId')); // pastikan userId ada
      const data = await apiClient.getOrders(userId);
      set({ orders: data });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch orders' });
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // GET ORDER BY ID
  // ===========================
  getOrderById: async (orderId: number) => {
    try {
      set({ loading: true, error: null });

      const res = await apiClient.getOrderById(orderId);
      set({ orderDetails: res });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch order" });
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // CANCEL ORDER (User/Admin)
  // ===========================
  cancelOrder: async (orderId: number, reason: string) => {
    try {
      set({ loading: true, error: null });

      await apiClient.cancelOrder(orderId, reason);

      // Refresh orders
      const { getOrders } = get();
      await getOrders();
    } catch (err: any) {
      set({ error: err?.message || "Failed to cancel order" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // CONFIRM DELIVERY (User)
  // ===========================
  confirmOrderDelivery: async (orderId: number) => {
    try {
      set({ loading: true, error: null });

      await apiClient.confirmOrderDelivery(orderId);

      // Refresh details
      await get().getOrderById(orderId);
    } catch (err: any) {
      set({ error: err?.message || "Failed to confirm order" });
    } finally {
      set({ loading: false });
    }
  },

  // ===========================
  // GET ORDER STATUS (Live Tracking)
  // ===========================
  getOrderStatus: async (orderId: number) => {
    try {
      set({ loading: true, error: null });

      const res = await apiClient.getOrderStatus(orderId);
      set({ orderStatus: res });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch order status" });
    } finally {
      set({ loading: false });
    }
  },

  clearOrderDetails: () => set({ orderDetails: null, orderStatus: null })
}));
