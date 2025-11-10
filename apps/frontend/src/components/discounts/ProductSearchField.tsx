'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Product,
  ProductSearchFieldProps,
} from '@/lib/types/discounts/discounts';
import type { AxiosError } from 'axios';

export function ProductSearchField({
  onChange,
  setError,
}: ProductSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/discounts/products`, {
          params: { search: query },
        });
        setResults(res.data || []);
      } catch (err) {
        const error = err as AxiosError<{ msg?: string }>;
        setError(error.response?.data?.msg || 'Failed to search products.');
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    onChange(product.id);
    setQuery('');
    setResults([]);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    onChange(null);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        Select Product <span className="text-red-500">*</span>
      </label>

      {selectedProduct ? (
        <div className="flex max-h-9 items-center justify-between rounded border p-2">
          <span>{selectedProduct.name}</span>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            ✕
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Search product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {loading && (
            <div className="absolute top-2 right-2 text-xs text-gray-400">
              Loading...
            </div>
          )}

          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border bg-white shadow">
              {results.map((p) => (
                <li
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="cursor-pointer p-2 hover:bg-sky-50"
                >
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
