// src/store/ordersStore.ts
'use client';

import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import { OrderResponse, AddressInfo, ShippingMethodInfo, CreateOrderData } from '@/lib/types/order/order';
import { MidtransPaymentResponse } from '@/lib/types/payment/payment';

interface OrdersState {
  addresses: AddressInfo[];
  shippingMethods: ShippingMethodInfo[];
  selectedAddressId: number | null;
  selectedShippingMethodId: number | null;
  shippingCost: number | null;
  voucherCode: string | null;
  notes: string | null;
  paymentMethod: string | null;
  order: OrderResponse | null;
  midtransPayment: MidtransPaymentResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  fetchShippingMethods: () => Promise<void>;
  calculateShippingCost: () => Promise<void>;
  createOrder: () => Promise<void>;
  initializeMidtransPayment: () => Promise<void>;

  setSelectedAddressId: (id: number) => void;
  setSelectedShippingMethodId: (id: number) => void;
  setVoucherCode: (code: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: string) => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  addresses: [],
  shippingMethods: [],
  selectedAddressId: null,
  selectedShippingMethodId: null,
  shippingCost: null,
  voucherCode: null,
  notes: null,
  paymentMethod: null,
  order: null,
  midtransPayment: null,
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.getAddresses();
      set({ addresses: res.data });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch addresses' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchShippingMethods: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.getShippingMethods();
      set({ shippingMethods: res.data });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch shipping methods' });
    } finally {
      set({ isLoading: false });
    }
  },

  calculateShippingCost: async () => {
    const { selectedAddressId, selectedShippingMethodId } = get();
    if (!selectedAddressId || !selectedShippingMethodId) return;
    set({ isLoading: true, error: null });
    try {
      const cart = await apiClient.getCart();
      const items = cart.data.map((item: any) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        weight: item.product.weight || 0,
      }));

      const res = await apiClient.calculateShippingCost({
        addressId: selectedAddressId,
        shippingMethodId: selectedShippingMethodId,
        items,
      });

      set({ shippingCost: res.data.cost });
    } catch (err: any) {
      set({ error: err.message || 'Failed to calculate shipping cost' });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async () => {
    const {
      selectedAddressId,
      selectedShippingMethodId,
      voucherCode,
      notes,
      shippingCost,
    } = get();

    if (!selectedAddressId || !selectedShippingMethodId) {
      set({ error: 'Please select address and shipping method' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const orderData: CreateOrderData = {
        address_id: selectedAddressId,
        shipping_method_id: selectedShippingMethodId,
        voucher_code: voucherCode || undefined,
        notes: notes || undefined,
      };

      const res = await apiClient.createOrder(orderData);
      set({ order: res.data, shippingCost: res.data.shipping_cost });
    } catch (err: any) {
      set({ error: err.message || 'Failed to create order' });
    } finally {
      set({ isLoading: false });
    }
  },

  initializeMidtransPayment: async () => {
    const { order, paymentMethod } = get();
    if (!order || !paymentMethod) {
      set({ error: 'Order or payment method missing' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.initializeMidtransPayment(
        order.id,
        paymentMethod
      );
      set({ midtransPayment: res.data });
    } catch (err: any) {
      set({ error: err.message || 'Failed to initialize payment' });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setSelectedShippingMethodId: (id) => set({ selectedShippingMethodId: id }),
  setVoucherCode: (code) => set({ voucherCode: code }),
  setNotes: (notes) => set({ notes }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  clearError: () => set({ error: null }),
}));
