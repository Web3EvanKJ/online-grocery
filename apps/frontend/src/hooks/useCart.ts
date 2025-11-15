// hooks/useCart.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { CartItem } from '../lib/types/cart/cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCart();
      // FIX: Access the nested data property
      const cartData = response as CartItem[];
      setCart(cartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await apiClient.addToCart(productId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      return false;
    }
  };

  const updateCartItem = async (cartId: number, quantity: number) => {
    try {
      await apiClient.updateCartItem(cartId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart');
      return false;
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      await apiClient.removeFromCart(cartId);
      await fetchCart();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from cart');
      return false;
    }
  };
  const clearError = () => {
    setError(null);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    loading,
    error,
    cartCount,
    cartTotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearError,
    refreshCart: fetchCart,
  };
};