'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Discount,
  DiscountFilters,
  DiscountTableProps,
} from '@/lib/types/discounts/discounts';
import type { AxiosError } from 'axios';
import DiscountShareTable from './DiscountShareTable';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function DiscountTable({
  onEdit,
  setError,
  store_id,
}: DiscountTableProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<DiscountFilters>({
    type: '',
    search: '',
    date: new Date().toISOString().split('T')[0],
    sortBy: '',
    sortOrder: '',
  });
  const [pendingFilters, setPendingFilters] = useState(filters);

  const fetchDiscounts = async () => {
    try {
      if (!store_id) return;

      const params = {
        page,
        limit,
        type: filters.type || undefined,
        product_name: filters.search || undefined,
        date: filters.date,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined,
        store_id: store_id,
      };
      const res = await api.get('/admin/discounts', { params });
      setDiscounts(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to fetch discounts.');
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [page, filters, store_id]);

  const applyFilters = () => {
    setPage(1);
    setFilters(pendingFilters);
  };

  const handleSortChange = (val: string) => {
    const [by, order] = val.split('-');
    setFilters((prev) => ({ ...prev, sortBy: by, sortOrder: order }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* LEFT: Search + Apply */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search product name..."
            value={pendingFilters.search}
            onChange={(e) =>
              setPendingFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-[200px] rounded-none"
          />
          <Button
            variant="outline"
            onClick={applyFilters}
            className="border-sky-300 text-sky-600"
          >
            Search
          </Button>
        </div>

        {/* RIGHT: Type + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={pendingFilters.type || 'all'}
            onValueChange={(val) => {
              const newType = val === 'all' ? '' : val;
              // so when user search the type remains the same
              setPendingFilters((prev) => ({ ...prev, type: newType }));
              setFilters((prev) => ({ ...prev, type: newType }));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] border-sky-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="store">Store</SelectItem>
              <SelectItem value="b1g1">b1g1</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select
            value={
              filters.sortBy && filters.sortOrder
                ? `${filters.sortBy}-${filters.sortOrder}`
                : ''
            }
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px] border-sky-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start_date-asc">Start Date: Asc</SelectItem>
              <SelectItem value="start_date-desc">Start Date: Desc</SelectItem>
              <SelectItem value="end_date-asc">End Date: Asc</SelectItem>
              <SelectItem value="end_date-desc">End Date: Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DiscountShareTable
        discounts={discounts}
        onEdit={onEdit}
        page={page}
        limit={limit}
      />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center space-x-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="border border-sky-200"
        >
          Prev
        </Button>
        <span className="text-sm font-medium text-sky-700">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="border border-sky-200"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
