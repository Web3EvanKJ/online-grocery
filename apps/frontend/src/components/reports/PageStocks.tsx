'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/axios';
import { ErrorModal } from '@/components/ErrorModal';
import { Button } from '../ui/button';

export default function PageStocks() {
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [productQuery, setProductQuery] = useState('');

  const [stores, setStores] = useState<any[]>([]);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalAdd: 0,
    totalDeduct: 0,
    totalEnd: 0,
  });

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // 🏪 Fetch stores (for filter)
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/admin/stocks/stores', {
          params: { role: 'super_admin' },
        });
        const storeOptions = [{ id: 'all', name: 'All Stores' }, ...res.data];
        setStores(storeOptions);
      } catch (err: any) {
        setError({
          open: true,
          message: err.response?.data?.msg || 'Failed to load stores',
        });
      }
    };
    fetchStores();
  }, []);

  // 📦 Fetch stock history
  const fetchStockHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stocks', {
        params: {
          role: 'super_admin',
          storeId: selectedStore,
          month: selectedMonth,
          productName: productQuery || undefined,
          page,
          limit,
        },
      });

      setStockHistory(res.data.data || []);
      setSummary(
        res.data.summary || { totalAdd: 0, totalDeduct: 0, totalEnd: 0 }
      );
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err: any) {
      setError({
        open: true,
        message: err.response?.data?.msg || 'Failed to load stock history data',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change (not search)
  useEffect(() => {
    fetchStockHistory();
  }, [selectedStore, selectedMonth, page]);

  const monthlySummary = useMemo(() => summary, [summary]);

  return (
    <div className="container mx-auto max-w-[95vw] text-sky-800">
      <ErrorModal
        open={error.open}
        message={error.message}
        onClose={() => setError({ open: false, message: '' })}
      />

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="text-2xl font-bold text-sky-700">Stock Report</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setPage(1);
              }}
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>

            <input
              type="month"
              className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Search Bar + Button */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search product..."
              className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
            />
            <Button
              className="bg-sky-600"
              onClick={() => {
                setPage(1);
                fetchStockHistory();
              }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* 📊 Monthly Summary */}
        <div className="rounded-md border border-sky-200 p-4">
          <h2 className="mb-4 text-xl font-semibold text-sky-700">
            Monthly Stock Summary — {selectedMonth}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-sky-50 p-4 text-center">
              <p className="text-sm text-sky-600">Total Additions</p>
              <p className="text-xl font-bold text-sky-700">
                {monthlySummary.totalAdd.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-sm text-red-600">Total Deductions</p>
              <p className="text-xl font-bold text-red-600">
                {monthlySummary.totalDeduct.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-sky-50 p-4 text-center">
              <p className="text-sm text-sky-600">Total Ending Stock</p>
              <p className="text-xl font-bold text-sky-700">
                {monthlySummary.totalEnd.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 📦 Stock Table */}
        <h2 className="mb-4 text-xl font-semibold text-sky-700">
          Stock Journal
        </h2>
        <div className="overflow-hidden rounded-xl border border-sky-100 bg-white">
          <table className="w-full border-collapse">
            <thead className="bg-sky-100">
              <tr className="text-left text-sky-800">
                <th className="p-4">Date</th>
                <th className="p-4">Store</th>
                <th className="p-4">Product</th>
                <th className="p-4">Type</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Note</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sky-500 italic"
                  >
                    Loading data...
                  </td>
                </tr>
              ) : stockHistory.length > 0 ? (
                stockHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-sky-100 transition hover:bg-sky-50"
                  >
                    <td className="p-4">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">{item.store}</td>
                    <td className="p-4">{item.product}</td>
                    <td
                      className={`p-4 font-medium ${item.type === 'in' ? 'text-sky-700' : 'text-red-600'}`}
                    >
                      {item.type === 'in' ? 'Addition' : 'Deduction'}
                    </td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4 text-gray-600">{item.note || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sky-500 italic"
                  >
                    No stock data available for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
      </main>
    </div>
  );
}
