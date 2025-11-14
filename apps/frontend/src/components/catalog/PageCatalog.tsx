'use client';
import { useEffect, useState } from 'react';
import { ProductCard } from '../ProductCard';
import { ErrorModal } from '../ErrorModal';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types/catalog/catalog';
import type { AxiosError } from 'axios';
import { useNearestStore } from '@/hooks/useNearestStore';

export default function PageCatalog() {
  const { store, loading: storeLoading, error: storeError } = useNearestStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (pageNum = 1, storeId?: number) => {
    if (!storeId) return; // wait for store info
    try {
      setLoading(true);
      const res = await api.get(`/productSearch`, {
        params: { page: pageNum, limit: 12, store_id: storeId },
      });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store?.store_id) {
      fetchProducts(page, store.store_id);
    }
  }, [page, store]);

  // Handle location errors
  if (storeError) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <ErrorModal
          open={true}
          message={storeError}
          onClose={() => window.location.reload()}
        />
      </main>
    );
  }

  // Show loading until store and products are ready
  if (storeLoading || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-gray-500">
          {storeLoading ? 'Detecting nearest location' : 'Loading product...'}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-2 text-3xl font-bold text-sky-600">Product List</h1>
        {store && (
          <p className="mb-6 text-sm text-gray-600">
            Show product from: <strong>{store.store_name}</strong> (
            {store.distance_km} km)
          </p>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No Product.</p>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border border-sky-200"
          >
            Prev
          </Button>
          <span className="py-2 text-sm text-sky-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border border-sky-200"
          >
            Next
          </Button>
        </div>
      </div>

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </main>
  );
}
