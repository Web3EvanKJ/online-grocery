'use client';
import { FormField } from '@/components/FormField';
import { useState, useEffect, useCallback } from 'react';

const allProducts = [
  'Beras 5kg',
  'Minyak Goreng 1L',
  'Gula Pasir 1kg',
  'Telur Ayam 1kg',
  'Sabun Cuci Piring',
  'Sampo 250ml',
];

export function ProductSearchField({
  value,
  onChange,
  disabled,
  setFieldValue,
}: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const debounceSearch = useCallback((text: string) => {
    if (!text.trim()) return setResults([]);
    const timer = setTimeout(() => {
      const filtered = allProducts.filter((p) =>
        p.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!disabled && query) {
      const cleanup = debounceSearch(query);
      return cleanup;
    }
  }, [query, debounceSearch, disabled]);

  return (
    <div className="relative">
      <FormField
        id="product"
        name="product"
        label="Product Name"
        value={value}
        onChange={(e) => {
          onChange(e);
          setQuery(e.target.value);
        }}
        disabled={disabled}
        required
      />
      {!disabled && results.length > 0 && (
        <ul className="absolute top-15 z-10 w-full rounded-md border border-sky-100 bg-white shadow">
          {results.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                setFieldValue('product', item);
                setResults([]);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-sky-50"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
