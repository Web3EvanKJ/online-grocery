'use client';

import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CartItem as CartItemComp } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const fetchCart = useCartStore(s => s.fetchCart);
  const items = useCartStore(s => s.items);
  const loading = useCartStore(s => s.loading);
  const error = useCartStore(s => s.error);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
        <div className="p-6 bg-white rounded shadow">
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <button onClick={() => fetchCart()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Try again</button>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600 mt-2">
                  {items.length} item{items.length > 1 ? 's' : ''} in your cart
                </p>
              </div>

              <div className="divide-y">
                {[...items]
                  .sort((a, b) => a.id - b.id)
                  .map(it => (
                    <CartItemComp key={it.id} item={it} />
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
