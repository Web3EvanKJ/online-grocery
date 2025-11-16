// apps/frontend/src/store/cartStore.ts
'use client';

import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  images?: Array<{ image_url: string }>;
}

export interface CartItem {
  id: number;
  user_id?: number;
  product_id?: number;
  quantity: number;
  product: CartProduct;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  loading: boolean;
  updatingIds: number[]; // cart item ids being updated (for per-item spinner)
  error?: string | null;

  computeTotals: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, qty?: number) => Promise<boolean>;
  updateCartItem: (cartId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  updatingIds: [],
  error: null,

  computeTotals: () => {
    const items = get().items || [];
    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalPrice = items.reduce(
      (acc, i) => acc + i.quantity * Number(i.product.price),
      0
    );
    set({ totalQuantity, totalPrice });
  },

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      // backend returns ARRAY of cart items
      const data = await apiClient.getCart();
      // ensure prices are numbers
      const normalized: CartItem[] = (data || []).map((i: any) => ({
        ...i,
        product_id: i.product_id || i.product?.id,
        product: {
          ...i.product,
          price: Number(i.product.price),
        },
      }));
      set({ items: normalized });
      get().computeTotals();
      return;
    } catch (err: any) {
      console.error('fetchCart error', err);
      set({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId: number, qty = 1) => {
    set({ loading: true, error: null });
    try {
      // optimistic: no complex optimistic merge — backend returns created item
      const newItem = await apiClient.addToCart(productId, qty); // should return single cart item or array depending on backend
      // if backend returns single item:
      const items = get().items;
      const exists = items.find(i => i.id === newItem.id || i.product.id === newItem.product?.id);
      let updated: CartItem[];
      if (exists) {
        updated = items.map(i => (i.id === newItem.id ? { ...newItem, product: { ...newItem.product, price: Number(newItem.product.price) } } : i));
      } else {
        const normalizedNew = { ...newItem, product: { ...newItem.product, price: Number(newItem.product.price) } };
        updated = [...items, normalizedNew];
      }
      set({ items: updated });
      get().computeTotals();
      return true;
    } catch (err: any) {
      console.error('addItem error', err);
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateCartItem: async (cartId: number, quantity: number) => {
    const prev = get().items;
    // optimistic local update
    const optimistic = prev.map(it => (it.id === cartId ? { ...it, quantity } : it));
    set({ items: optimistic, updatingIds: [...get().updatingIds, cartId] });
    get().computeTotals();

    try {
      // backend: updateCart(cartId, quantity) returning full array (per your backend)
      const updatedArray = await apiClient.updateCart(cartId, quantity);
      // ensure normalized
      const normalized = (updatedArray || []).map((i: any) => ({
        ...i,
        product: { ...i.product, price: Number(i.product.price) },
      }));
      set({ items: normalized });
      get().computeTotals();
      return true;
    } catch (err: any) {
      console.error('updateCartItem error', err);
      // revert
      set({ items: prev, error: err instanceof Error ? err.message : String(err) });
      get().computeTotals();
      return false;
    } finally {
      set(state => ({ updatingIds: state.updatingIds.filter(id => id !== cartId) }));
    }
  },

  removeFromCart: async (cartId: number) => {
    const prev = get().items;
    // optimistic remove locally
    const optimistic = prev.filter(i => i.id !== cartId);
    set({ items: optimistic, updatingIds: [...get().updatingIds, cartId] });
    get().computeTotals();

    try {
      // backend returns full array after deletion
      const updatedArray = await apiClient.removeCart(cartId);
      const normalized = (updatedArray || []).map((i: any) => ({
        ...i,
        product: { ...i.product, price: Number(i.product.price) },
      }));
      set({ items: normalized });
      get().computeTotals();
      return true;
    } catch (err: any) {
      console.error('removeFromCart error', err);
      // revert
      set({ items: prev, error: err instanceof Error ? err.message : String(err) });
      get().computeTotals();
      return false;
    } finally {
      set(state => ({ updatingIds: state.updatingIds.filter(id => id !== cartId) }));
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await apiClient.clearCart();
      set({ items: [] });
      get().computeTotals();
    } catch (err: any) {
      console.error('clearCart error', err);
      set({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
