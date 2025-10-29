'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { ErrorModal } from '@/components/ErrorModal';
import { PurchaseBox } from './PurchaseBox';

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  discount?: number;
  stock?: number;
  isB1G1?: boolean;
};

export function ProductDetail() {
  const { slug } = useParams(); // ✅ grabs 'classic-burger' from /details/classic-burger

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 Error handling state
  const [error, setError] = useState<string | null>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Lol!!');
        setLoading(true);
        console.log('Hello!!');

        const res = await api.get(`/productSearch/${slug}`);
        setProduct(res.data.data);
        setSelectedImage(res.data.data.images[0]);
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        const message =
          err.response?.data?.msg ||
          'Terjadi kesalahan saat mengambil data produk.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <>
        <ErrorModal
          open={!!error}
          message={error}
          onClose={() => setError(null)}
        />
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Produk tidak ditemukan.</p>
        </main>
      </>
    );
  }

  const shortText = product.description.slice(0, 180) + '...';

  return (
    <>
      {/* 🔴 Error Modal */}
      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />

      <main className="min-h-screen py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
          {/* Left section */}
          <div className="flex flex-col items-center">
            <div className="relative h-64 w-64">
              <img
                src={selectedImage ?? ''}
                alt={product.name}
                className="h-full w-full object-contain transition-all duration-300"
              />
            </div>
            <div className="mt-6 flex gap-3">
              {product.images.map((img, index) => (
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
            <div className="rounded-xl bg-white py-5">
              <h1 className="mb-3 text-2xl font-bold">{product.name}</h1>

              <p className="mb-2 text-2xl font-bold text-blue-500">
                Rp {product.price.toLocaleString('id-ID')}
              </p>

              {product.originalPrice && (
                <p className="text-gray-400 line-through">
                  Rp {product.originalPrice.toLocaleString('id-ID')}
                </p>
              )}

              <p className="mb-4 text-sm">Stock: {product.stock}</p>

              <div>
                <h2 className="mb-2 text-lg font-semibold text-gray-800">
                  Deskripsi
                </h2>
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

            <PurchaseBox />
          </div>
        </div>
      </main>
    </>
  );
}
