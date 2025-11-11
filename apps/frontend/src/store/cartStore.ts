import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: (amount?: number) => void;
  decrementCartCount: (amount?: number) => void;
  resetCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartCount: 0,
      setCartCount: (count) => set({ cartCount: count }),
      incrementCartCount: (amount = 1) => 
        set({ cartCount: get().cartCount + amount }),
      decrementCartCount: (amount = 1) => 
        set({ cartCount: Math.max(0, get().cartCount - amount) }),
      resetCart: () => set({ cartCount: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);