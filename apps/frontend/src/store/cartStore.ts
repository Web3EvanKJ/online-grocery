import { create } from 'zustand';
import { CartItem } from '../lib/types/cart/cart';
import { apiClient } from '../lib/api';

interface CartState {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  cartCount: number;
  cartTotal: number;
  updatingIds: number[]; // ADDED: track items being updated

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateCartItem: (cartId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;

  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => {
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
    updatingIds: [], // ADDED

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
        set({ error: err instanceof Error ? err.message : 'Failed to add to cart' });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    updateCartItem: async (cartId, quantity) => {
      const { cart, updatingIds } = get();

      // 1️⃣ Update lokal langsung
      const prevCart = [...cart];
      const updatedCart = cart.map(item =>
        item.id === cartId ? { ...item, quantity } : item
      );
      updateTotals(updatedCart);

      // 2️⃣ Tambah cartId ke updatingIds
      set({ updatingIds: [...updatingIds, cartId] });

      try {
        await apiClient.updateCartItem(cartId, quantity);
        return true;
      } catch (err) {
        // 3️⃣ Revert jika gagal
        updateTotals(prevCart);
        set({ error: err instanceof Error ? err.message : 'Failed to update cart' });
        return false;
      } finally {
        // 4️⃣ Hapus cartId dari updatingIds
        set(state => ({ updatingIds: state.updatingIds.filter(id => id !== cartId) }));
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
        set({ error: err instanceof Error ? err.message : 'Failed to remove item' });
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
        set({ error: err instanceof Error ? err.message : 'Failed to clear cart' });
      } finally {
        set({ loading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});
