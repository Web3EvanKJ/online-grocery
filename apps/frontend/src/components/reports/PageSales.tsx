'use client';
import { useEffect, useMemo, useState } from 'react';

// --- Dummy sales data ---
const dummySales = [
  {
    id: 1,
    store: 'Blue Mart',
    category: 'Beverages',
    product: 'Mineral Water 1L',
    totalSales: 12000000,
    period: '2025-10',
  },
  {
    id: 2,
    store: 'Ocean Store',
    category: 'Snacks',
    product: 'Potato Chips',
    totalSales: 8500000,
    period: '2025-10',
  },
  {
    id: 3,
    store: 'Blue Mart',
    category: 'Snacks',
    product: 'Chocolate Bar',
    totalSales: 4500000,
    period: '2025-10',
  },
  {
    id: 4,
    store: 'Ocean Store',
    category: 'Beverages',
    product: 'Iced Coffee',
    totalSales: 6000000,
    period: '2025-10',
  },
];

export default function PageSales() {
  const isSuperAdmin = true;

  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productQuery, setProductQuery] = useState('');

  const [debouncedProduct, setDebouncedProduct] = useState('');

  // ⏳ Debounce for product search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProduct(productQuery);
    }, 100);
    return () => clearTimeout(handler);
  }, [productQuery, selectedStore]);

  // Store & category options
  const stores = useMemo(
    () => ['all', ...Array.from(new Set(dummySales.map((s) => s.store)))],
    []
  );

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(dummySales.map((s) => s.category)))],
    []
  );

  // Filter data
  const filtered = dummySales.filter((item) => {
    const matchStore = selectedStore === 'all' || item.store === selectedStore;
    const matchMonth = item.period.startsWith(selectedMonth);
    const matchCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchProduct =
      debouncedProduct === '' ||
      item.product.toLowerCase().includes(debouncedProduct.toLowerCase());
    return matchStore && matchMonth && matchCategory && matchProduct;
  });

  // --- 💰 Monthly Summary ---
  const monthlySummary = useMemo(() => {
    if (filtered.length === 0) return { totalRevenue: 0, avgSales: 0 };

    const totalRevenue = filtered.reduce((sum, i) => sum + i.totalSales, 0);
    const avgSales = totalRevenue / filtered.length;
    return { totalRevenue, avgSales };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-sky-50 text-sky-800">
      {/* Header */}
      <header className="border-b border-sky-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-sky-700">Sales Report</h1>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
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
                  <option key={store} value={store}>
                    {store === 'all' ? 'All Stores' : store}
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
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
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

          {/* Product Search */}
          <input
            type="text"
            placeholder="Search product..."
            className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
          />
        </div>

        {/* 💰 Monthly Summary Section */}
        <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-sky-700">
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
                {filtered.length}
              </p>
            </div>
          </div>
        </div>

        {/* 📦 Detailed Sales Table */}
        <div className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-md">
          <table className="w-full border-collapse">
            <thead className="bg-sky-100">
              <tr className="text-left text-sky-800">
                <th className="p-4">Store</th>
                <th className="p-4">Category</th>
                <th className="p-4">Product</th>
                <th className="p-4">Total Sales (Rp)</th>
                <th className="p-4">Period</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr
                    key={item.id}
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
                    No sales data available for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
