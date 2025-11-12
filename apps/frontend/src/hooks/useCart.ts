import { useState, useEffect } from 'react';
import { CartItem, AddToCartRequest } from '@/lib/types/cart/cart';
import { apiClient } from '@/lib/api';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCart();
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (data: AddToCartRequest) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.addToCart(data);
      await fetchCart(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.updateCartItem(cartId, quantity);
      await fetchCart(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.removeFromCart(cartId);
      await fetchCart(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.clearCart();
      setCart([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cart,
    loading,
    error,
    cartTotal,
    cartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
};