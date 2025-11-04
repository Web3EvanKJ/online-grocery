'use client';
import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/axios';
import { ErrorModal } from '../ErrorModal';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { SummaryCard } from './SummaryCard';
import { AxiosError } from 'axios';
import { SalesReportItem } from '@/lib/types/reports/reports';

export default function PageSales() {
  const role = 'super_admin'; // or 'super_admin'
  const userId = 1;
  const isSuperAdmin = role === 'super_admin';
  const [selectedStore, setSelectedStore] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>(
    'all'
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [productQuery, setProductQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    avgSales: 0,
    totalProducts: 0,
  });
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

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [storeRes, catRes] = await Promise.all([
          api.get('/admin/sales/stores', { params: { role, userId } }),
          api.get('/admin/sales/categories'),
        ]);
        const catOptions = [
          { id: 'all', name: 'All Categories' },
          ...catRes.data,
        ];
        setCategories(catOptions);
        if (role === 'super_admin') {
          const storeOptions = [
            { id: 'all', name: 'All Stores' },
            ...storeRes.data,
          ];
          setStores(storeOptions);
          setSelectedStore('all');
        } else {
          setStores(storeRes.data);
          if (storeRes.data.length > 0) {
            setSelectedStore(storeRes.data[0].id);
          }
        }
      } catch (err) {
        const error = err as AxiosError<{ msg?: string }>;
        setError(error.response?.data?.msg || 'Failed to fetch filters.');
      }
    };
    fetchFilters();
  }, [role]);

  const fetchSales = async () => {
    try {
      const res = await api.get('/admin/sales/report', {
        // prettier-ignore
        params: { role, storeId: selectedStore, categoryId: selectedCategory, productName: productQuery,
          month: selectedMonth,
          page,
          limit,
          sort: sortOrder,
        },
      });
      setSalesData(res.data.data || []);
      setSummary(
        res.data.summary || { totalRevenue: 0, avgSales: 0, totalProducts: 0 }
      );
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to fetch sales data.');
    }
  };
  useEffect(() => {
    fetchSales();
  }, [selectedStore, selectedCategory, selectedMonth, sortOrder, page]);
  const toggleSort = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  return (
    <>
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="text-2xl font-bold text-sky-700">Sales Report</h1>
        <FilterBar
          stores={stores}
          categories={categories}
          selectedStore={selectedStore}
          selectedCategory={selectedCategory}
          selectedMonth={selectedMonth}
          productQuery={productQuery}
          onStoreChange={(val) => {
            setSelectedStore(val !== 'all' ? Number(val) : val);
            setPage(1);
          }}
          onCategoryChange={(val) => {
            setSelectedCategory(val !== 'all' ? Number(val) : val);
            setPage(1);
          }}
          onMonthChange={(val) => {
            setSelectedMonth(val);
            setPage(1);
          }}
          onProductQueryChange={setProductQuery}
          onSearch={() => {
            setPage(1);
            fetchSales();
          }}
          isSuperAdmin={isSuperAdmin}
        />
        <div className="border border-sky-100 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-sky-700">
            Monthly Sales Summary — {selectedMonth}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* prettier-ignore */}
            <SummaryCard title="Total Revenue" value={`Rp ${summary.totalRevenue.toLocaleString()}`} />
            {/* prettier-ignore */}
            <SummaryCard title="Average per Product" value={`Rp ${summary.avgSales.toLocaleString()}`} color="bg-green-50"/>
            {/* prettier-ignore */}
            <SummaryCard title="Products Sold" value={summary.totalProducts} color="bg-sky-100" />
          </div>
        </div>
        <h2 className="mb-4 text-xl font-semibold text-sky-700">
          Sales Journal
        </h2>
        <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
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
              {salesData.length > 0 ? (
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
                  <td colSpan={5} className="p-4 text-center text-sky-500">
                    No sales data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* prettier-ignore */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        {/* prettier-ignore */}
        <ErrorModal open={!!error} message={error} onClose={() => setError(null)}
        />
      </main>
    </>
  );
}
