// apps/frontend/src/components/cart/CartSummary.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export const CartSummary = () => {
  const total = useCartStore(s => s.totalPrice);
  const qty = useCartStore(s => s.totalQuantity);
  const loading = useCartStore(s => s.loading);

  return (
    <div className="bg-white rounded-lg shadow p-6 border">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="flex justify-between text-sm mb-2">
        <span>Items</span>
        <span>{qty}</span>
      </div>

      <div className="flex justify-between text-sm mb-4">
        <span>Subtotal</span>
        <span>Rp {total.toLocaleString()}</span>
      </div>

      <div className="border-t pt-4">
        <Link
          href="/checkout"
          className={`block text-center py-3 px-4 rounded-lg font-semibold ${
            total > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Updating...' : (total > 0 ? 'Proceed to Checkout' : 'Cart is empty')}
        </Link>
      </div>
    </div>
  );
};
