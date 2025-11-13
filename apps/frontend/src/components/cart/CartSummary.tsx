// components/cart/CartSummary.tsx
'use client';
import { useCart } from '../../hooks/useCart';
import Link from 'next/link';

export const CartSummary = () => {
  const { cartTotal, cartCount } = useCart();

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Items ({cartCount})</span>
          <span>Rp {cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-gray-600">Calculated at checkout</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>Rp {cartTotal.toLocaleString()}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
};