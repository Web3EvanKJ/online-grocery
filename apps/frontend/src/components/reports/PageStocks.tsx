'use client';
import { useEffect, useMemo, useState } from 'react';

// --- Dummy monthly stock data (with multiple entries per product) ---
const dummyStockHistory = [
  {
    id: 1,
    store: 'Blue Mart',
    product: 'Aqua 600ml',
    date: '2025-10-02',
    addition: 200,
    deduction: 0,
    ending: 200,
  },
  {
    id: 2,
    store: 'Blue Mart',
    product: 'Aqua 600ml',
    date: '2025-10-15',
    addition: 300,
    deduction: 120,
    ending: 380,
  },
  {
    id: 3,
    store: 'Ocean Store',
    product: 'Indomie Goreng',
    date: '2025-10-05',
    addition: 100,
    deduction: 30,
    ending: 70,
  },
  {
    id: 4,
    store: 'Ocean Store',
    product: 'Indomie Goreng',
    date: '2025-10-20',
    addition: 100,
    deduction: 50,
    ending: 120,
  },
];

export default function PageStocks() {
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [productQuery, setProductQuery] = useState('');

  const [debouncedProduct, setDebouncedProduct] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProduct(productQuery);
    }, 100);
    return () => clearTimeout(handler);
  }, [productQuery, selectedStore]);

  // Store options
  const stores = useMemo(
    () => [
      'all',
      ...Array.from(new Set(dummyStockHistory.map((s) => s.store))),
    ],
    []
  );

  // Filtered data by store, month, and product
  const filtered = dummyStockHistory.filter((item) => {
    const matchStore = selectedStore === 'all' || item.store === selectedStore;
    const matchMonth = item.date.startsWith(selectedMonth);
    const matchProduct =
      debouncedProduct === '' ||
      item.product.toLowerCase().includes(debouncedProduct.toLowerCase());
    return matchStore && matchMonth && matchProduct;
  });

  // --- 📊 Monthly Summary ---
  const monthlySummary = useMemo(() => {
    if (filtered.length === 0)
      return { totalAdd: 0, totalDeduct: 0, totalEnd: 0 };

    const totalAdd = filtered.reduce((sum, i) => sum + i.addition, 0);
    const totalDeduct = filtered.reduce((sum, i) => sum + i.deduction, 0);
    const totalEnd = filtered.reduce((sum, i) => sum + i.ending, 0);
    return { totalAdd, totalDeduct, totalEnd };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-sky-50 text-sky-800">
      {/* Header */}
      <header className="border-b border-sky-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-sky-700">Stock Report</h1>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Store */}
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

            {/* Month */}
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

        {/* 📊 Monthly Summary Section */}
        <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-sky-700">
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
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-600">Total Ending Stock</p>
              <p className="text-xl font-bold text-green-700">
                {monthlySummary.totalEnd.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 📦 Detailed Stock Table */}
        <div className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-md">
          <table className="w-full border-collapse">
            <thead className="bg-sky-100">
              <tr className="text-left text-sky-800">
                <th className="p-4">Date</th>
                <th className="p-4">Store</th>
                <th className="p-4">Product</th>
                <th className="p-4">Addition</th>
                <th className="p-4">Deduction</th>
                <th className="p-4">Ending</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-sky-100 transition hover:bg-sky-50"
                  >
                    <td className="p-4">{item.date}</td>
                    <td className="p-4">{item.store}</td>
                    <td className="p-4">{item.product}</td>
                    <td className="p-4 text-sky-700">{item.addition}</td>
                    <td className="p-4 text-red-500">{item.deduction}</td>
                    <td className="p-4 font-semibold text-green-700">
                      {item.ending}
                    </td>
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
      </main>
    </div>
  );
}
