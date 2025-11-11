// apps/frontend/src/app/orders/success/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Clear cart on success
    localStorage.removeItem('cart-storage');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pesanan Berhasil!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Terima kasih telah berbelanja di Online Grocery Store
          </p>
          
          {orderId && (
            <p className="text-gray-600 mb-6">
              Order ID: <strong>#{orderId}</strong>
            </p>
          )}
          
          <p className="text-gray-600 mb-8">
            Kami akan mengirimkan konfirmasi pesanan dan detail pengiriman ke email Anda.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/orders')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lihat Pesanan
            </button>
            
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Lanjut Belanja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}