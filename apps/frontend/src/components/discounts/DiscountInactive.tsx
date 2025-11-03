import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Discount, DiscountTableProps } from '@/lib/types/discounts/discounts';
import type { AxiosError } from 'axios';
import DiscountShareTable from './DiscountShareTable';

export function DiscountInactive({
  onEdit,
  setError,
  store_id,
}: DiscountTableProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    product_name: '',
    sortBy: 'start_date',
    sortOrder: 'asc',
  });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const fetchHistory = async () => {
    try {
      const params = {
        page,
        limit,
        type: filters.type || undefined,
        product_name: filters.product_name || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        store_id: store_id,
      };
      const res = await api.get('/admin/discounts/history', { params });
      setDiscounts(res.data.data || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to fetch inactive.');
    }
  };
  useEffect(() => {
    fetchHistory();
  }, [page, filters, store_id]);
  const handleSortChange = (sortField: string, sortOrder: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortField,
      sortOrder,
    }));
  };
  const applyFilters = () => {
    setPage(1);
    setFilters(pendingFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search..."
            value={pendingFilters.product_name}
            onChange={(e) =>
              setPendingFilters((prev) => ({
                ...prev,
                product_name: e.target.value,
              }))
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
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={pendingFilters.type || 'all'}
            onValueChange={(val) => {
              const newType = val === 'all' ? '' : val;
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
          <Select
            value={
              filters.sortBy && filters.sortOrder
                ? `${filters.sortBy}-${filters.sortOrder}`
                : ''
            }
            onValueChange={(val) => {
              const [by, order] = val.split('-');
              handleSortChange(by, order);
            }}
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

      <DiscountShareTable
        discounts={discounts}
        onEdit={onEdit}
        page={page}
        limit={limit}
      />

      <div className="mt-3 flex items-center justify-center space-x-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
        >
          Next
        </Button>
      </div>
    </div>
  );
}
