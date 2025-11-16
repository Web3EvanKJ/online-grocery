'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export const CartSummary = () => {
  const cartTotal = useCartStore((s) => s.cartTotal);
  const cartCount = useCartStore((s) => s.cartCount);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Items ({cartCount})</span>
          <span>Rp {cartTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>Rp {cartTotal.toLocaleString()}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block bg-green-600 text-white py-3 rounded-lg text-center hover:bg-green-700"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
};