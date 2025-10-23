'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductModal } from './ProductModal';
import { ProductTable } from './ProductTable';
import { ConfirmationModal } from '../ConfirmationModal';
import { CategoryManager } from './CategoryManager';
import { Products } from '@/lib/types/products/products';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/axios';
import { ErrorModal } from '../ErrorModal';

export function ProductPage() {
  const userRole = 'super admin';
  const isSuperAdmin = userRole === 'super admin';

  const [products, setProducts] = useState<Products[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Products | null>(null);
  const [error, setError] = useState({ open: false, message: '' });

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc' | 'price_asc' | 'price_desc'>(
    'asc'
  );
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products', {
        params: { search, sort, page, limit: 5 },
      });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError({ open: true, message: err.response?.data?.msg || err.message });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleEdit = (product: Products) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product: Products) => {
    setDeleteTarget(product);
    setConfirmDelete(true);
  };

  const confirmDeleteHandler = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`);
      fetchProducts();
    } catch (err: any) {
      setError({ open: true, message: err.response?.data?.msg || err.message });
    } finally {
      setConfirmDelete(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-sky-800">
            Product Management
          </h2>
          {isSuperAdmin && (
            <Button
              className="bg-sky-500 text-white hover:bg-sky-600"
              onClick={() => {
                setSelectedProduct(null);
                setModalOpen(true);
              }}
            >
              + Add Product
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex gap-3">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-md border border-sky-300 px-2 py-1 text-sm text-sky-700"
          >
            <option value="asc">Sort: A–Z</option>
            <option value="desc">Sort: Z–A</option>
            <option value="price_asc">Price: Low–High</option>
            <option value="price_desc">Price: High–Low</option>
          </select>
        </form>

        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Pagination */}
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="px-3 py-1 text-sky-700">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <CategoryManager isSuperAdmin={isSuperAdmin} />

      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          fetchProducts();
        }}
        product={selectedProduct}
        isSuperAdmin={isSuperAdmin}
      />

      <ConfirmationModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteHandler}
        message="Are you sure you want to delete this product?"
        warning
      />

      <ErrorModal
        open={error.open}
        message={error.message}
        onClose={() => setError({ open: false, message: '' })}
      />
    </div>
  );
}
