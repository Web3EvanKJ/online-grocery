'use client';
import { useEffect, useState } from 'react';
import { ProductCard } from '../ProductCard';
import { ErrorModal } from '../ErrorModal';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';

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
  distance?: number;
  isB1G1?: boolean;
};

export default function PageCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/productSearch?page=${pageNum}&limit=10&store_id=1`
      );
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-700">
          Daftar Produk
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Memuat produk...</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {/* === Pagination === */}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="py-2 text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
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
