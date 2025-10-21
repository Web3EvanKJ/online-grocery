'use client';

import { useState } from 'react';
import { ProductInfo } from './ProductInfo';
import { PurchaseBox } from './PurchaseBox';

export type Product = {
  name: string;
  price: number;
  images: string[];
  brand: string;
  category: string;
  volume: string;
  stock: number;
  description: string;
};

const mockProduct: Product = {
  name: 'Aqua Air Mineral Botol 330 ml',
  price: 3400,
  images: ['/images/aqua.png', '/images/aqua2.png', '/images/aqua3.png'],
  brand: 'AQUA',
  category: 'Air Mineral',
  volume: '330 ml',
  stock: 10,
  description: `AQUA merupakan air mineral berkualitas yang berasal dari sumber air pegunungan pilihan dan terlindungi. AQUA melindungi keseimbangan alami ekosistem sumber airnya sehingga kekayaan dan kealamian mineralnya terjaga.

AQUA Air Mineral 330 ml adalah air mineral dalam kemasan, yang diproduksi dalam kemasan botol yang praktis. Praktis untuk dibawa dalam genggaman ke mana saja dan kapan saja dalam setiap aktivitas. Kebutuhan air setiap hari dapat terjaga dengan baik di tengah kesibukan dengan minuman botol ini. Menjaga Anda tetap hidrasi dan sehat sepanjang hari. Jadikan AQUA Air Mineral sebagai air minum dalam kemasan pilihan Anda dan nikmati segala kebaikan alam dalam setiap tetesnya. Tersedia dalam kemasan botol 330 ml yang cocok untuk menemani Anda gerak dan beraktivitas seharian. Temukan arti kemurnian air yang sebenarnya bersama AQUA Air Mineral 330 ml.`,
};

export function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(mockProduct.images[0]);

  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
        {/* Left section */}
        <div className="flex flex-col items-center">
          <div className="relative h-64 w-64">
            <img
              src={selectedImage}
              alt={mockProduct.name}
              className="h-full w-full object-contain transition-all duration-300"
            />
          </div>
          <div className="mt-6 flex gap-3">
            {mockProduct.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`rounded-lg border p-1 transition-all ${
                  selectedImage === img
                    ? 'border-2 border-blue-400'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <img
                  src={img}
                  alt={`thumb-${index}`}
                  className="h-12 w-12 object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-col gap-6">
          <ProductInfo product={mockProduct} />
          <PurchaseBox />
        </div>
      </div>
    </main>
  );
}
