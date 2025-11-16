'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useEffect } from 'react';

export default function Navbar() {
  const cartCount = useCartStore((s) => s.cartCount);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    fetchCart(); // hanya sekali saat navbar mount
  }, [fetchCart]);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Your App</h1>

          <div className="flex items-center gap-4 relative">
            <Link href="/auth" className="nav-btn">Login</Link>
            <Link href="/orders" className="nav-btn">Orders</Link>

            <div className="relative">
              <Link href="/cart" className="nav-btn relative">
                Cart
              </Link>

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
