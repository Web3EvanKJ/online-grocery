'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const ErrorContent = () => {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('type') || 'general';
  const message = searchParams.get('message');

  const getErrorConfig = (type: string) => {
    const configs: { [key: string]: { emoji: string; title: string; description: string; tips: string[] } } = {
      'payment_failed': {
        emoji: '💸',
        title: 'Oops! Payment Failed',
        description: 'Sepertinya ada masalah dengan pembayaranmu. Jangan khawatir, mari coba lagi!',
        tips: [
          'Cek saldo atau limit kartu kamu',
          'Pastikan data pembayaran sudah benar',
          'Coba metode pembayaran lain'
        ]
      },
      'out_of_stock': {
        emoji: '📦',
        title: 'Stok Habis!',
        description: 'Beberapa barang di keranjangmu sudah habis. Jangan sedih, kita punya banyak pilihan lain!',
        tips: [
          'Cek produk serupa yang tersedia',
          'Tunggu notifikasi restock',
          'Explore produk recommended'
        ]
      },
      'timeout': {
        emoji: '⏰',
        title: 'Waktu Habis',
        description: 'Sesi pemesananmu sudah berakhir. Yuk, mulai lagi dari awal!',
        tips: [
          'Proses checkout lebih cepat',
          'Siapkan data pembayaran dulu',
          'Pastikan koneksi internet stabil'
        ]
      },
      'general': {
        emoji: '😅',
        title: 'Aduh! Ada yang tidak beres',
        description: message || 'Terjadi kesalahan tak terduga. Tenang, tim kita sedang memperbaikinya!',
        tips: [
          'Refresh halaman dan coba lagi',
          'Cek koneksi internet kamu',
          'Hubungi customer service jika berlanjut'
        ]
      }
    };

    return configs[type] || configs.general;
  };

  const { emoji, title, description, tips } = getErrorConfig(errorType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Emoji */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">{emoji}</span>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>

        {/* Helpful Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips & Tricks:</h3>
          <ul className="text-sm text-blue-800 space-y-2 text-left">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Funny Encouragement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Jangan menyerah! </span>
            Even superheroes sometimes need to try twice! 🦸‍♂️
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            🔄 Try Again
          </button>
          
          <Link
            href="/cart"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            🛒 Back to Cart
          </Link>

          <Link
            href="/"
            className="block w-full text-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            🏠 Go Home
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Masih stuck? Hubungi kita!
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <span className="text-gray-600">📞 1500-123</span>
            <span className="text-gray-600">✉️ help@groceries.id</span>
          </div>
        </div>
      </div>
    </div>
  );
};