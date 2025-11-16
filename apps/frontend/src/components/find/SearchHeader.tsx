'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Grid } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { ErrorModal } from '../ErrorModal';
import type { AxiosError } from 'axios';

export function SearchHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();

  // === Fetch categories ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/sales/categories');
        setCategories(res.data || []);
      } catch (err) {
        const error = err as AxiosError<{ msg?: string }>;
        setError(error.response?.data?.msg || 'Failed to load categories.');
      }
    };
    fetchCategories();
  }, []);

  // === Handle Search ===
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const newParams = new URLSearchParams(params.toString());
    if (query.trim()) newParams.set('name', query.trim());
    else newParams.delete('name');

    router.push(`/find?${newParams.toString()}`);
  };

  // === Handle Category Selection ===
  const handleCategoryClick = (catName: string) => {
    const newParams = new URLSearchParams(params.toString());

    if (catName === 'All') {
      newParams.delete('category');
      setSelectedCategory('');
    } else {
      newParams.set('category', catName);
      setSelectedCategory(catName);
    }

    router.push(`/find?${newParams.toString()}`);
    setOpen(false);
  };

  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}

        {/* Category Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-sky-300 text-sky-700"
            onClick={() => setOpen(!open)}
          >
            <Grid className="h-4 w-4" />
            {selectedCategory || 'Category'}
            <ChevronDown className="h-4 w-4" />
          </Button>

          {open && (
            <div className="absolute top-12 left-0 z-10 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
              <h4 className="border-b px-4 py-2 font-semibold text-gray-700">
                Category
              </h4>
              <ul className="max-h-96 overflow-y-auto">
                {/* "All" Category Option */}
                <li
                  onClick={() => handleCategoryClick('All')}
                  className={`cursor-pointer px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-700 ${
                    selectedCategory === '' ? 'bg-sky-100' : ''
                  }`}
                >
                  All Category
                </li>

                {/* Dynamic Categories */}
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`cursor-pointer px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-700 ${
                      selectedCategory === cat.name ? 'bg-sky-100' : ''
                    }`}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Input
            placeholder="Search product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-sky-300 focus:ring-1 focus:ring-sky-400 focus:outline-none"
          />
          <button type="submit">
            <Search className="absolute top-2.5 right-3 h-5 w-5 text-sky-500" />
          </button>
        </form>
      </div>

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </header>
  );
}
