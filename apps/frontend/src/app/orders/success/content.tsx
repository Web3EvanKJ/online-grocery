'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const SuccessContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [celebrations, setCelebrations] = useState<string[]>([]);

  useEffect(() => {
    // Simple celebration effect tanpa confetti
    const celebrationMessages = [
      "🎉 Yeay! Order Berhasil!",
      "🥳 Selamat! Pembelian Sukses!",
      "✨ Pesananmu Sedang Diproses!",
      "🚀 Siap-siap Dikirim!",
      "💖 Terima Kasih Sudah Berbelanja!"
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      setCelebrations(prev => [...prev.slice(-2), celebrationMessages[currentIndex]]);
      currentIndex = (currentIndex + 1) % celebrationMessages.length;
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        {/* Floating Animation Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              {['🎉', '✨', '⭐', '🎊', '💫'][i % 5]}
            </div>
          ))}
        </div>

        {/* Animated Checkmark */}
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <svg 
              className="w-12 h-12 text-green-500 animate-bounce"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Rotating Celebration Messages */}
          {celebrations.length > 0 && (
            <div className="mb-4 h-12 flex items-center justify-center">
              <p className="text-lg font-semibold text-green-600 animate-pulse">
                {celebrations[celebrations.length - 1]}
              </p>
            </div>
          )}

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Order Successful! 🥳
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Terima kasih sudah berbelanja!
          </p>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: <span className="font-mono font-semibold text-green-600">#{orderId}</span>
            </p>
          )}

          {/* Fun Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 transform hover:scale-105 transition-transform">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Fun Fact:</span> Pesananmu sedang disiapkan dengan penuh cinta! 💖
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              Kamu akan menerima email konfirmasi segera
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
              Pesanan akan diproses dalam 1-2 jam
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 animate-fade-in" style={{animationDelay: '1s'}}>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
              Siap-siap menerima barang kesayangan! 🛍️
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 relative z-10">
            <Link
              href={`/orders/${orderId || ''}`}
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              🚀 Track My Order
            </Link>
            
            <Link
              href="/orders"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all font-medium hover:border-gray-400"
            >
              📦 View All Orders
            </Link>

            <Link
              href="/"
              className="block w-full text-green-600 py-3 px-4 rounded-lg hover:bg-green-50 transition-all font-medium hover:text-green-700"
            >
              🛒 Continue Shopping
            </Link>
          </div>

          {/* Fun Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              "Groceries delivered with ❤️ from our store to your door!"
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS untuk animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};