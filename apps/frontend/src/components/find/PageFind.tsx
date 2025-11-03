'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '../ProductCard';
import { ErrorModal } from '../ErrorModal';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  discount?: number;
  stock?: number;
  isb1g1?: boolean;
};

export function PageFind() {
  const params = useSearchParams();
  const router = useRouter();

  const queryName = params.get('name') || '';
  const queryCategory = params.get('category') || '';
  const queryDiscounted = params.get('discounted') || '';
  const querySort = (params.get('sort') as 'asc' | 'desc') || 'asc';
  const queryPage = Number(params.get('page')) || 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/productSearch', {
        params: {
          page: queryPage,
          limit: 10,
          name: queryName,
          category: queryCategory,
          discounted: queryDiscounted,
          sort: querySort,
          store_id: 1,
        },
      });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [queryName, queryCategory, queryDiscounted, querySort, queryPage]);

  const updateUrlParam = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(params.toString());
    if (value && value !== 'delete') newParams.set(key, String(value));
    else newParams.delete(key);
    router.push(`/find?${newParams.toString()}`);
  };

  return (
    <main className="min-h-screen bg-blue-50 px-5 py-10 md:px-15">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-1 text-xl font-semibold text-gray-700">
          Hasil Pencarian untuk{' '}
          <span className="text-blue-700">"{queryName}"</span>
        </h2>
        <p className="mb-6 text-gray-500">
          Menampilkan {products.length} produk
        </p>

        {/* === Filter & Sort Controls === */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Select
            onValueChange={(v) => updateUrlParam('discounted', v)}
            defaultValue={queryDiscounted || 'delete'}
          >
            <SelectTrigger className="w-40 border-blue-300">
              <SelectValue placeholder="Diskon?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delete">Semua</SelectItem>
              <SelectItem value="true">Diskon</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) => updateUrlParam('sort', v)}
            defaultValue={querySort}
          >
            <SelectTrigger className="w-44 border-blue-300">
              <SelectValue placeholder="Urutkan harga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Harga Terendah</SelectItem>
              <SelectItem value="desc">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat produk...</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}

        {/* === Pagination === */}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            disabled={queryPage === 1}
            onClick={() => updateUrlParam('page', queryPage - 1)}
          >
            Prev
          </Button>
          <span className="py-2 text-sm text-gray-600">
            Page {queryPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={queryPage >= totalPages}
            onClick={() => updateUrlParam('page', queryPage + 1)}
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
