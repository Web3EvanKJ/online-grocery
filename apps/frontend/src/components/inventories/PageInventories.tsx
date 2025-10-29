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
import { StockProduct } from '@/lib/types/stocks/stocks';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PageInventories() {
  const [data, setData] = useState<StockProduct[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'alphabet' | 'stock_desc'>(
    'alphabet'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // still usable for UI
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'increase' | 'decrease' | '';
    product: StockProduct | null;
  }>({ open: false, type: '', product: null });

  /** Fetch stores for super admin */
  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/inventories/stores/list', {
        params: { role: 'super_admin' },
      });
      setStores(res.data);
      if (res.data.length > 0 && selectedStore === null) {
        setSelectedStore(res.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch stores');
    }
  };

  /** Fetch products (inventories) */
  const fetchData = async () => {
    if (!selectedStore) return;
    try {
      const res = await api.get('/admin/inventories', {
        params: {
          page,
          limit: 10,
          search,
          store_id: selectedStore,
          role: 'super_admin',
          sort: sortField,
        },
      });

      setData(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch inventories');
    }
  };

  const handleSortChange = (field: string) => {
    setSortField(field as any);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) fetchData();
  }, [page, search, sortField, selectedStore]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-sky-700">
        Inventory Management
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        <div className="max-w-xs">
          <Select
            value={selectedStore ? String(selectedStore) : ''}
            onValueChange={(v) => setSelectedStore(Number(v))}
          >
            <SelectTrigger className="rounded-none border border-blue-200">
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

        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border border-sky-200"
        />

        <Button
          onClick={() => fetchData()}
          className="bg-sky-500 text-white hover:bg-sky-600"
        >
          Search
        </Button>
      </div>

      <InventoryTable
        data={data}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onEditClick={(product, type) => setModal({ open: true, type, product })}
      />

      {/* Pagination */}
      <div className="flex justify-center gap-3 pt-4">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <span className="self-center text-gray-700">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
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
