'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/axios';
import { ErrorModal } from '@/components/ErrorModal';
import { FilterBar } from '@/components/reports/FilterBar';
import { Pagination } from '@/components/reports/Pagination';
import { SummaryCard } from '@/components/reports/SummaryCard';
import type { AxiosError } from 'axios';

export interface StockHistoryItem {
  id: number;
  date: Date;
  store: string;
  product: string;
  type: 'in' | 'out';
  quantity: number;
  note?: string;
}

export default function PageStocks() {
  const role = 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [productQuery, setProductQuery] = useState('');
  const [stores, setStores] = useState<{ id: number | 'all'; name: string }[]>(
    []
  );
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [summary, setSummary] = useState({
    totalAdd: 0,
    totalDeduct: 0,
    totalEnd: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/admin/stocks/stores', {
          params: { role },
        });
        setStores([{ id: 'all', name: 'All Stores' }, ...res.data]);
      } catch (err) {
        const error = err as AxiosError<{ msg?: string }>;
        setError(error.response?.data?.msg || 'Failed to load store data.');
      }
    };
    fetchStores();
  }, [role]);
  const fetchStockHistory = async () => {
    try {
      const res = await api.get('/admin/stocks', {
        params: {
          role,
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
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(
        error.response?.data?.msg || 'Failed to load stock history data.'
      );
    }
  };
  useEffect(() => {
    fetchStockHistory();
  }, [selectedStore, selectedMonth, page]);
  const monthlySummary = useMemo(() => summary, [summary]);

  return (
    <div className="container mx-auto max-w-[95vw]">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="text-2xl font-bold text-sky-700">Stock Report</h1>
        <FilterBar
          isSuperAdmin={isSuperAdmin}
          stores={stores}
          selectedStore={selectedStore}
          selectedMonth={selectedMonth}
          productQuery={productQuery}
          onStoreChange={(val) => {
            setSelectedStore(val);
            setPage(1);
          }}
          onMonthChange={(val) => {
            setSelectedMonth(val);
            setPage(1);
          }}
          onProductQueryChange={setProductQuery}
          onSearch={() => {
            setPage(1);
            fetchStockHistory();
          }}
        />
        <div className="border border-sky-200 p-4">
          <h2 className="mb-4 text-xl font-semibold text-sky-700">
            Monthly Stock Summary — {selectedMonth}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Additions"
              value={monthlySummary.totalAdd.toLocaleString()}
            />
            <SummaryCard
              title="Total Deductions"
              value={monthlySummary.totalDeduct.toLocaleString()}
              color="bg-red-50"
            />
            <SummaryCard
              title="Total Ending Stock"
              value={monthlySummary.totalEnd.toLocaleString()}
            />
          </div>
        </div>

        <h2 className="mb-4 text-xl font-semibold text-sky-700">
          Stock Journal
        </h2>
        <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
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
              {stockHistory.length > 0 ? (
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
                      className={`p-4 font-medium ${
                        item.type === 'in' ? 'text-sky-700' : 'text-red-600'
                      }`}
                    >
                      {item.type === 'in' ? 'Addition' : 'Deduction'}
                    </td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="max-w-[300px] truncate p-4 text-gray-600">
                      {item.note || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-sky-500">
                    No stock data available for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </div>
  );
}
