'use client';
import { useEffect, useState } from 'react';
import { InventoryTable } from './InventoryTable';
import { EditStockModal } from './EditStockModal';
import { ErrorModal } from '@/components/ErrorModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StockProduct } from '@/lib/types/inventories/inventories';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AxiosError } from 'axios';

export default function PageInventories() {
  const role = 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  const [data, setData] = useState<StockProduct[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'alphabet' | 'stock'>('alphabet');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'increase' | 'decrease' | '';
    product: StockProduct | null;
  }>({ open: false, type: '', product: null });

  // Fetch stores for super admin
  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/inventories/stores/list', {
        params: { role: 'super_admin' },
      });
      setStores(res.data);
      if (res.data.length > 0 && selectedStore === null) {
        setSelectedStore(res.data[0].id);
      }
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to fetch stores.');
    }
  };

  // Fetch inventories of products
  const fetchData = async () => {
    try {
      const res = await api.get('/admin/inventories', {
        params: {
          page,
          limit: 10,
          search,
          store_id: selectedStore,
          role: 'super_admin',
          sort: sortField,
          order: sortOrder,
        },
      });

      setData(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to fetch inventories.');
    }
  };

  useEffect(() => {
    isSuperAdmin && fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) fetchData();
  }, [page, sortField, sortOrder, selectedStore]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-sky-700">
        Inventory Management
      </h1>

      <div className="flex flex-col justify-items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="flex min-w-[30vw] gap-2">
          <Input
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-none border border-sky-200"
          />
          <Button
            onClick={() => fetchData()}
            className="border border-sky-400 bg-white text-sky-600 hover:bg-sky-100"
          >
            Search
          </Button>
        </div>

        {/* Sort Select */}
        <div className="flex gap-4">
          <Select
            value={`${sortField}_${sortOrder}`}
            onValueChange={(v) => {
              const [field, order] = v.split('_');
              setSortField(field as 'alphabet' | 'stock');
              setSortOrder(order as 'asc' | 'desc');
            }}
          >
            <SelectTrigger className="w-[180px] border border-blue-200 text-sky-600">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="text-sky-600">
              <SelectItem value="alphabet_asc">Sort: A-Z</SelectItem>
              <SelectItem value="alphabet_desc">Sort: Z-A</SelectItem>
              <SelectItem value="stock_asc">Stock: Low-High</SelectItem>
              <SelectItem value="stock_desc">Stock: High-Low</SelectItem>
            </SelectContent>
          </Select>
          {/* Store Select */}
          {isSuperAdmin && (
            <div className="max-w-xs">
              <Select
                value={selectedStore ? String(selectedStore) : ''}
                onValueChange={(v) => setSelectedStore(Number(v))}
              >
                <SelectTrigger className="border border-blue-200 text-sky-600">
                  <SelectValue placeholder="Choose Store" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <InventoryTable
        data={data}
        onEditClick={(product, type) => setModal({ open: true, type, product })}
      />

      {/* Pagination */}
      <div className="flex justify-center gap-3 pt-4">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="border-sky-300"
        >
          Prev
        </Button>
        <span className="self-center text-sky-700">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="border-sky-300"
        >
          Next
        </Button>
      </div>

      <EditStockModal
        open={modal.open}
        type={modal.type}
        product={modal.product}
        storeId={selectedStore ?? 0}
        onClose={() => setModal({ open: false, type: '', product: null })}
        onSuccess={fetchData}
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </div>
  );
}
