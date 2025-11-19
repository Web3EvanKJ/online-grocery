/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { CreateOrderRequest, OrderResponse } from "@/lib/types/order/order";

interface OrdersState {
  orders: any[];
  orderDetails: any | null;
  orderStatus: any | null;

  loading: boolean;
  error: string | null;

  // User methods
  createOrder: (data: CreateOrderRequest) => Promise<OrderResponse>;
  getOrders: (page?: number, limit?: number) => Promise<void>;
  getOrderById: (orderId: number) => Promise<void>;
  cancelOrder: (orderId: number, reason: string) => Promise<void>;
  confirmOrderDelivery: (orderId: number) => Promise<void>;
  getOrderStatus: (orderId: number) => Promise<void>;

  // Admin methods
  getAdminOrders: (page?: number, limit?: number) => Promise<void>;
  getAdminOrderDetails: (orderId: number) => Promise<void>;
  updateOrderStatus: (orderId: number, status: string) => Promise<void>;
  verifyPayment: (orderId: number, isVerified: boolean) => Promise<void>;
  adminCancelOrder: (orderId: number, reason: string) => Promise<void>;

  clearOrderDetails: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  orderDetails: null,
  orderStatus: null,
  loading: false,
  error: null,

  // ===== USER METHODS =====
  
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

   getOrders: async (userId) => {
    try {
      set({ loading: true, error: null });
      const data = await apiClient.getOrders(userId);
      set({ orders: data });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch orders" });
    } finally {
      set({ loading: false });
    }
  },

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

  cancelOrder: async (orderId: number, reason: string) => {
    try {
      set({ loading: true, error: null });
      await apiClient.cancelOrder(orderId, reason);
      await get().getOrders();
    } catch (err: any) {
      set({ error: err?.message || "Failed to cancel order" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  confirmOrderDelivery: async (orderId: number) => {
    try {
      set({ loading: true, error: null });
      await apiClient.confirmOrderDelivery(orderId);
      await get().getOrderById(orderId);
    } catch (err: any) {
      set({ error: err?.message || "Failed to confirm order" });
    } finally {
      set({ loading: false });
    }
  },

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

  // ===== ADMIN METHODS =====

  getAdminOrders: async (page = 1, limit = 50) => {
    try {
      set({ loading: true, error: null });
      const data = await apiClient.getAdminOrders(page, limit);
      set({ orders: data });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch admin orders" });
    } finally {
      set({ loading: false });
    }
  },

  getAdminOrderDetails: async (orderId: number) => {
    try {
      set({ loading: true, error: null });
      const res = await apiClient.getAdminOrderDetails(orderId);
      set({ orderDetails: res });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch order details" });
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId: number, status: string) => {
    try {
      set({ loading: true, error: null });
      await apiClient.updateOrderStatus(orderId, status);
      await get().getAdminOrderDetails(orderId);
    } catch (err: any) {
      set({ error: err?.message || "Failed to update order status" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  verifyPayment: async (orderId: number, isVerified: boolean) => {
    try {
      set({ loading: true, error: null });
      await apiClient.verifyPayment(orderId, isVerified);
      await get().getAdminOrderDetails(orderId);
    } catch (err: any) {
      set({ error: err?.message || "Failed to verify payment" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  adminCancelOrder: async (orderId: number, reason: string) => {
    try {
      set({ loading: true, error: null });
      await apiClient.adminCancelOrder(orderId, reason);
      await get().getAdminOrders();
    } catch (err: any) {
      set({ error: err?.message || "Failed to cancel order" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearOrderDetails: () => set({ orderDetails: null, orderStatus: null }),
}));