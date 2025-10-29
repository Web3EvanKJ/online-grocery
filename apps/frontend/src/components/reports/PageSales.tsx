'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/axios';
import { ErrorModal } from '../ErrorModal';
import { Button } from '../ui/button';

export default function PageSales() {
  const isSuperAdmin = true;
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [productQuery, setProductQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [salesData, setSalesData] = useState<any[]>([]);
  const [stores, setStores] = useState<{ id: number | 'all'; name: string }[]>(
    []
  );
  const [categories, setCategories] = useState<
    { id: number | 'all'; name: string }[]
  >([]);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch stores & categories
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [storeRes, catRes] = await Promise.all([
          api.get('/admin/sales/stores', {
            params: { role: 'super_admin', userId: 1 },
          }),
          api.get('/admin/sales/categories'),
        ]);

        const storeOptions = [
          { id: 'all', name: 'All Stores' },
          ...storeRes.data,
        ];
        const catOptions = [
          { id: 'all', name: 'All Categories' },
          ...catRes.data,
        ];

        setStores(storeOptions);
        setCategories(catOptions);
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to fetch filters');
      }
    };
    fetchFilters();
  }, []);

  // Fetch sales data
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sales/report', {
        params: {
          role: 'super_admin',
          userId: 1,
          storeId: selectedStore,
          categoryId: selectedCategory,
          productName: productQuery,
          month: selectedMonth,
          page,
          limit,
          sort: sortOrder,
        },
      });

      setSalesData(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [selectedStore, selectedCategory, selectedMonth, sortOrder, page]);

  const monthlySummary = useMemo(() => {
    if (!salesData.length) return { totalRevenue: 0, avgSales: 0 };
    const totalRevenue = salesData.reduce((sum, i) => sum + i.totalSales, 0);
    const avgSales = totalRevenue / salesData.length;
    return { totalRevenue, avgSales };
  }, [salesData]);

  const toggleSort = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  return (
    <div className="text-sky-800">
      {error && (
        <ErrorModal
          open={!!error}
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="text-2xl font-bold text-sky-700">Sales Report</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <select
                className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}

            <select
              className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="month"
              className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          {/* Search bar + button */}
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
                fetchSales();
              }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* 💰 Monthly Summary */}
        <div className="rounded-xl border border-sky-100 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-sky-700">
            Monthly Sales Summary — {selectedMonth}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-sky-50 p-4 text-center">
              <p className="text-sm text-sky-600">Total Revenue</p>
              <p className="text-xl font-bold text-sky-700">
                Rp {monthlySummary.totalRevenue.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-600">Average per Product</p>
              <p className="text-xl font-bold text-green-700">
                Rp {monthlySummary.avgSales.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="rounded-lg bg-sky-100 p-4 text-center">
              <p className="text-sm text-sky-600">Products Sold</p>
              <p className="text-xl font-bold text-sky-700">
                {salesData.length}
              </p>
            </div>
          </div>
        </div>

        {/* 📦 Table */}
        <h2 className="mb-4 text-xl font-semibold text-sky-700">
          Stock Journal
        </h2>
        <div className="overflow-hidden rounded-xl border border-sky-100 bg-white">
          <table className="w-full border-collapse">
            <thead className="bg-sky-100">
              <tr className="text-left text-sky-800">
                <th className="p-4">Store</th>
                <th className="p-4">Category</th>
                <th className="p-4">Product</th>
                <th className="cursor-pointer p-4" onClick={toggleSort}>
                  Total Sales (Rp){' '}
                  <span className="text-sm">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                </th>
                <th className="p-4">Period</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-sky-500 italic"
                  >
                    Loading data...
                  </td>
                </tr>
              ) : salesData.length > 0 ? (
                salesData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-sky-100 transition hover:bg-sky-50"
                  >
                    <td className="p-4 font-medium">{item.store}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4">{item.product}</td>
                    <td className="p-4 font-semibold text-sky-700">
                      Rp {item.totalSales.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">{item.period}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-sky-500 italic"
                  >
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
