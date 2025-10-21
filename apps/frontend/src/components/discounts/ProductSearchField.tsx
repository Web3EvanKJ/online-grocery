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

type Props = {
  fieldName?: string; // e.g. 'product_name'
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  setFieldValue: (field: string, value: any) => void;
  error: any;
  touched: any;
  handleBlur: any;
};

export function ProductSearchField({
  fieldName = 'product_name',
  value,
  onChange,
  disabled,
  setFieldValue,
  error,
  touched,
  handleBlur,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const debounceSearch = useCallback((text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const filtered = allProducts.filter((p) =>
        p.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!disabled) {
      // run debounce only when query changes
      const cleanup = debounceSearch(query);
      return cleanup;
    }
    // if disabled, clear results
    setResults([]);
  }, [query, debounceSearch, disabled]);

  return (
    <div className="relative">
      {/* show a small badge that the field is locked when disabled */}
      <FormField
        id={fieldName}
        name={fieldName}
        label="Product Name"
        value={value}
        onChange={(e) => {
          onChange(e); // update Formik value
          setQuery(e.target.value); // update local query for search
        }}
        disabled={disabled}
        required
        error={error}
        touched={touched}
        onBlur={handleBlur}
      />

      {/* results dropdown */}
      {!disabled && results.length > 0 && (
        <ul className="absolute top-15 z-20 mt-1 w-full rounded-md border border-sky-100 bg-white shadow">
          {results.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                setFieldValue(fieldName, item);
                setResults([]);
                setQuery(item);
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
