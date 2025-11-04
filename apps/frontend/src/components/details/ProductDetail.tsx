'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { ErrorModal } from '@/components/ErrorModal';
import { PurchaseBox } from './PurchaseBox';
import { Product } from '@/lib/types/productDetails/productDetails';
import { AxiosError } from 'axios';
import { Gift } from 'lucide-react';
import { useNearestStore } from '@/hooks/useNearestStore';

export function ProductDetail() {
  const { slug } = useParams();

  const { store, loading: storeLoading, error: storeError } = useNearestStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('');

  // Fetch product once we have the store info
  useEffect(() => {
    const fetchProduct = async () => {
      if (!store) return; // wait until store is available

      try {
        setLoading(true);
        const res = await api.get(`/productSearch/${slug}`, {
          params: {
            store_id: store.store_id,
          },
        });

        setProduct(res.data.data);
        setSelectedImage(res.data.data.images[0]);
      } catch (err) {
        const error = err as AxiosError<{ msg?: string }>;
        setError(error.response?.data?.msg || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, store]);

  // Loading states
  if (storeLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </main>
    );
  }

  // Store failed but fallback didn't work (rare)
  if (storeError && !store) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">{storeError}</p>
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
          <p className="text-gray-500">Product not found.</p>
        </main>
      </>
    );
  }

  const shortText = product.description?.slice(0, 180) + '...';

  return (
    <>
      <main className="min-h-screen py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
          {/* Left section */}
          <div className="flex flex-col items-center p-6">
            <div className="relative h-64 w-64 rounded-md border-2 border-sky-600">
              <img
                src={selectedImage ?? ''}
                alt={product.name}
                className="h-full w-full rounded-md object-contain transition-all duration-300"
              />
            </div>
            <div className="mt-6 flex gap-3">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`rounded-lg border p-1 transition-all ${
                    selectedImage === img
                      ? 'border-2 border-sky-400'
                      : 'border-gray-200 hover:border-sky-200'
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
              <h1 className="mb-2 text-2xl font-bold">{product.name}</h1>

              {product.isb1g1 && (
                <div className="mb-2 flex max-w-13 items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Gift size={12} className="text-white" />
                  B1G1
                </div>
              )}

              {product.discount &&
                product.discountInputType === 'percentage' && (
                  <p className="max-w-10 rounded bg-sky-500 text-center text-xs font-semibold text-white opacity-70">
                    -{product.discount}%
                  </p>
                )}
              {product.discount && product.discountInputType === 'nominal' && (
                <p className="max-w-15 rounded bg-sky-500 py-0.5 text-center text-xs font-semibold text-white opacity-70">
                  -Rp {product.discount}
                </p>
              )}

              <p className="mb-2 text-2xl font-bold text-sky-500">
                Rp {product.price?.toLocaleString('id-ID')}
              </p>

              {product.originalPrice && (
                <p className="text-gray-400 line-through">
                  Rp {product.originalPrice?.toLocaleString('id-ID')}
                </p>
              )}

              <p className="border-b pb-4 text-sm">Stock: {product.stock}</p>

              <div>
                <h2 className="my-2 text-lg font-semibold text-gray-800">
                  Description
                </h2>
                <p className="whitespace-pre-line text-gray-700">
                  {expanded ? product.description : shortText}
                </p>
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 font-semibold text-sky-400 hover:underline"
              >
                {expanded ? 'Close' : 'See more...'}
              </button>
            </div>

            <PurchaseBox stock={Number(product.stock)} />
          </div>
        </div>
      </main>

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </>
  );
}
