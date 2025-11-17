'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const totalQuantity = useCartStore((s) => s.totalQuantity); // pakai totalQuantity
  const fetchCart = useCartStore((s) => s.fetchCart);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Function to check auth status
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Initial auth check
    checkAuth();

    // Listen for auth state changes (from login)
    const handleAuthChange = () => {
      console.log('Auth state changed - updating navbar');
      checkAuth();
    };

    // Add event listener
    window.addEventListener('authStateChange', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    fetchCart(); // hanya sekali saat navbar mount
  }, [fetchCart]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    
    // Notify other components about logout
    window.dispatchEvent(new Event('authStateChange'));
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/auth';
    
    if (user.role === 'store_admin' || user.role === 'super_admin') {
      return '/admin/dashboard';
    } else {
      return `/dashboarduser/${user.id}`;
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    
    if (user.role === 'store_admin' || user.role === 'super_admin') {
      return 'Admin Dashboard';
    } else {
      return 'My Dashboard';
    }
  };

  // Don't render anything during SSR to avoid hydration mismatches
  if (!isClient) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Grocify
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {/* Show minimal content during SSR */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium opacity-0">
                Loading...
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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
            {isLoggedIn ? (
              <>
                {/* Dashboard Badge - Always shown when logged in */}
                <Link
                  href={getDashboardLink()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {getDashboardLabel()}
                </Link>

                {/* Orders Link */}
                <Link
                  href="/orders"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Orders
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              /* Show login when user is not logged in */
              <Link
                href="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Login
              </Link>
            )}

            {/* Cart Link (always visible) */}
            <Link
              href="/cart"
              className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Cart
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
