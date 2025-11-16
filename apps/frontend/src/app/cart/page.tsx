'use client';

import { useEffect } from 'react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  // Ambil state & actions dari cartStore
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const error = useCartStore((s) => s.error);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearError = useCartStore((s) => s.clearError);

  // Fetch cart sekali saat mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Log error jika ada
  useEffect(() => {
    if (error) {
      console.error('Cart error:', error);
      // Optional: tampilkan toast notification di sini
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchCart();
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600 mt-2">
                  {cart.length} item{cart.length > 1 ? 's' : ''} in your cart
                </p>
              </div>
              
              <div className="divide-y">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="lg:w-1/3">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
