'use client';

import { useState } from 'react';
import { Product } from './ProductDetail';
import { MapPin } from 'lucide-react';

export function ProductInfo({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);

  const shortText = product.description.slice(0, 180) + '...';

  return (
    <div className="rounded-xl bg-white py-5">
      <h1 className="mb-3 text-2xl font-bold">{product.name}</h1>

      <p className="mb-4 text-2xl font-bold text-blue-500">
        Rp {product.price.toLocaleString('id-ID')}
      </p>

      <p className="mb-4 text-sm">Stock: {product.stock}</p>

      <div className="flex gap-2">
        <MapPin />
        <p className="mb-4 text-sm">{1} KM</p>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Deskripsi</h2>
        <p className="whitespace-pre-line text-gray-700">
          {expanded ? product.description : shortText}
        </p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 font-semibold text-blue-400 hover:underline"
      >
        {expanded ? 'Tutup' : 'Lihat Selengkapnya'}
      </button>
    </div>
  );
}
