'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Grid } from 'lucide-react';

const categories = [
  'Kebutuhan Dapur',
  'Kebutuhan Ibu & Anak',
  'Kebutuhan Rumah',
  'Makanan',
  'Minuman',
  'Produk Segar & Beku',
  'Personal Care',
  'Kebutuhan Kesehatan',
  'Lifestyle',
  'Pet Foods',
];

export function SearchHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">Logo</div>

        {/* Category Button */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-blue-300 text-blue-700"
            onClick={() => setOpen(!open)}
          >
            <Grid className="h-4 w-4" />
            Kategori
            <ChevronDown className="h-4 w-4" />
          </Button>

          {open && (
            <div className="absolute top-12 left-0 z-10 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
              <h4 className="border-b px-4 py-2 font-semibold text-gray-700">
                Kategori
              </h4>
              <ul className="max-h-96 overflow-y-auto">
                {categories.map((cat) => (
                  <li
                    key={cat}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="text-sm">{cat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <Input
            placeholder="Temukan produk favoritmu"
            className="w-full border-blue-300 focus-visible:ring-blue-200"
          />
          <Search className="absolute top-2.5 right-3 h-5 w-5 text-blue-500" />
        </div>
      </div>
    </header>
  );
}
