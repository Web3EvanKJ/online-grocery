'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  const { 
    cart, 
    loading, 
    error, 
    refreshCart,
    clearError 
  } = useCart();

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Cart error:', error);
      // Bisa tambahkan toast notification di sini
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
              clearError?.();
              refreshCart();
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
                  <CartItem 
                    key={item.id} 
                    item={item} 
                  />
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