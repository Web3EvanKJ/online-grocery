'use client';
import { FilterBarProps } from '@/lib/types/reports/reports';
import { Button } from '../ui/button';

export function FilterBar({
  stores,
  categories,
  selectedStore,
  selectedCategory,
  selectedMonth,
  productQuery,
  onStoreChange,
  onCategoryChange,
  onMonthChange,
  onProductQueryChange,
  onSearch,
  isSuperAdmin = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {isSuperAdmin && (
          <select
            className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
            value={selectedStore}
            onChange={(e) => onStoreChange(e.target.value)}
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}

        {categories && (
          <select
            className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
            value={selectedCategory}
            onChange={(e) => onCategoryChange?.(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="month"
          className="rounded-lg border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search product..."
          className="border border-sky-200 p-2 text-sky-700 focus:ring-2 focus:ring-sky-300"
          value={productQuery}
          onChange={(e) => onProductQueryChange(e.target.value)}
        />
        <Button className="bg-sky-600 hover:bg-sky-700" onClick={onSearch}>
          Search
        </Button>
      </div>
    </div>
  );
}
