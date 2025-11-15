// store/cartStore.ts
import { create } from 'zustand';
import { CartItem } from '../lib/types/cart/cart';
import { apiClient } from '../lib/api';

interface CartState {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  cartCount: number;
  cartTotal: number;

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateCartItem: (cartId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;

  clearError: () => void;
}

export const useCartStore = create<CartState>((set) => {
  const updateTotals = (cart: CartItem[]) => {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    set({ cart, cartCount, cartTotal });
  };

  return {
    cart: [],
    loading: false,
    error: null,
    cartCount: 0,
    cartTotal: 0,

    fetchCart: async () => {
      set({ loading: true, error: null });
      try {
        const cartData = (await apiClient.getCart()) as CartItem[];
        updateTotals(cartData);
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : 'Failed to fetch cart',
        });
      } finally {
        set({ loading: false });
      }
    },

    addToCart: async (productId, quantity) => {
      set({ loading: true, error: null });
      try {
        await apiClient.addToCart(productId, quantity);
        const cartData = (await apiClient.getCart()) as CartItem[];
        updateTotals(cartData);
        return true;
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : 'Failed to add to cart',
        });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    updateCartItem: async (cartId, quantity) => {
      set({ loading: true, error: null });
      try {
        await apiClient.updateCartItem(cartId, quantity);
        const cartData = (await apiClient.getCart()) as CartItem[];
        updateTotals(cartData);
        return true;
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : 'Failed to update cart',
        });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    removeFromCart: async (cartId) => {
      set({ loading: true, error: null });
      try {
        await apiClient.removeFromCart(cartId);
        const cartData = (await apiClient.getCart()) as CartItem[];
        updateTotals(cartData);
        return true;
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : 'Failed to remove item',
        });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    clearCart: async () => {
      set({ loading: true, error: null });
      try {
        await apiClient.clearCart();
        updateTotals([]);
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : 'Failed to clear cart',
        });
      } finally {
        set({ loading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});

// Load initial cart (optional)
(async () => {
  try {
    const store = useCartStore.getState();
    await store.fetchCart();
  } catch {}
})();
