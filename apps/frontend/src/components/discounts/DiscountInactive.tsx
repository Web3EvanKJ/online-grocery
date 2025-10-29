'use client';

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
} from '../ui/select';

type Discount = {
  id: number;
  store_id: number;
  product_id?: number | null;
  type: 'product' | 'store' | 'b1g1';
  inputType: 'percentage' | 'nominal';
  value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
  product_name?: string;
  store_name?: string;
};

interface DiscountInactiveProps {
  setError: (err: string | null) => void;
}

export function DiscountInactive({ setError }: DiscountInactiveProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Active filters for fetching
  const [filters, setFilters] = useState({
    type: '',
    date: '',
    product_name: '',
    sortBy: 'start_date',
    sortOrder: 'asc',
  });

  // Pending filters (controlled inputs)
  const [pendingFilters, setPendingFilters] = useState(filters);

  const fetchHistory = async () => {
    try {
      const params = {
        page,
        limit,
        type: filters.type || undefined,
        date: filters.date || undefined,
        product_name: filters.product_name || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      const res = await api.get('/admin/discounts/history', { params });
      setDiscounts(res.data.data || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch discount history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filters]);

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const applyFilters = () => {
    setPage(1);
    setFilters(pendingFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={pendingFilters.type}
          onValueChange={(val) =>
            setPendingFilters((prev) => ({
              ...prev,
              type: val === 'all' ? '' : val,
            }))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="store">Store</SelectItem>
            <SelectItem value="b1g1">B1G1</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search..."
          value={pendingFilters.product_name}
          onChange={(e) =>
            setPendingFilters((prev) => ({
              ...prev,
              product_name: e.target.value,
            }))
          }
          className="w-[200px]"
        />

        <Input
          type="date"
          value={pendingFilters.date}
          onChange={(e) =>
            setPendingFilters((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-[180px]"
        />

        <Button variant="outline" onClick={applyFilters}>
          Apply
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sky-100 text-left">
              <th className="border px-4 py-2">#</th>
              <th
                className="cursor-pointer border px-4 py-2 hover:bg-sky-50"
                onClick={() => handleSort('type')}
              >
                Type{' '}
                {filters.sortBy === 'type' &&
                  (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="cursor-pointer border px-4 py-2 hover:bg-sky-50"
                onClick={() => handleSort('inputType')}
              >
                Input Type{' '}
                {filters.sortBy === 'inputType' &&
                  (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="cursor-pointer border px-4 py-2 hover:bg-sky-50"
                onClick={() => handleSort('value')}
              >
                Value{' '}
                {filters.sortBy === 'value' &&
                  (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="cursor-pointer border px-4 py-2 hover:bg-sky-50"
                onClick={() => handleSort('start_date')}
              >
                Start Date{' '}
                {filters.sortBy === 'start_date' &&
                  (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="cursor-pointer border px-4 py-2 hover:bg-sky-50"
                onClick={() => handleSort('end_date')}
              >
                End Date{' '}
                {filters.sortBy === 'end_date' &&
                  (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="border px-4 py-2">Product</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No discount history found.
                </td>
              </tr>
            ) : (
              discounts.map((d, idx) => (
                <tr key={d.id} className="border-t hover:bg-sky-50">
                  <td className="border px-4 py-2">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="border px-4 py-2">{d.type}</td>
                  <td className="border px-4 py-2">{d.inputType}</td>
                  <td className="border px-4 py-2">{d.value}</td>
                  <td className="border px-4 py-2">
                    {new Date(d.start_date).toISOString().split('T')[0]}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(d.end_date).toISOString().split('T')[0]}
                  </td>
                  <td className="border px-4 py-2">{d.product_name || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-center space-x-3 text-sky-700">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </Button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
