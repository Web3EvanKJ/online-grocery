// apps/frontend/src/components/cart/EmptyCart.tsx
'use client';

import Link from 'next/link';

export const EmptyCart = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="inline-block bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-700">
          Shop Now
        </Link>
      </div>
    </div>
  );
};
