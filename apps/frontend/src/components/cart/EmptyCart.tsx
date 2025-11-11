'use client';

import Link from 'next/link';

export const EmptyCart: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Keranjang Belanja Kosong
      </h2>
      
      <p className="text-gray-600 mb-6">
        Yuk, tambahkan produk favorit Anda ke keranjang belanja!
      </p>
      
      <Link
        href="/products"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Mulai Belanja
      </Link>
    </div>
  );
};