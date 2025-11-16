'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Grocify
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            {/* Login Link */}
            <Link
              href="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Login
            </Link>

            {/* Orders Link */}
            <Link
              href="/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Orders
            </Link>

            {/* Cart Link with Badge */}
            <Link
              href="/cart"
              className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}