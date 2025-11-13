// components/cart/EmptyCart.tsx
'use client';
import Link from 'next/link';

export const EmptyCart = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-6">Add some items to get started!</p>
      <Link 
        href="/"
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        Start Shopping
      </Link>
    </div>
  );
};