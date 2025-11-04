'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

export function PurchaseBox({ stock }: { stock: number }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-5 rounded-sm border border-sky-200 bg-white p-5">
      <div>
        <p className="mb-2 font-semibold text-gray-800">Jumlah Pembelian</p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded-full border-sky-300 text-sky-600"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[2rem] text-center font-medium">
            {quantity}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-8 w-8 rounded-full border-sky-300 text-sky-600"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to cart */}
      <Button
        disabled={!stock}
        className={`w-full rounded-xl py-3 text-base font-semibold transition ${
          stock
            ? 'bg-sky-500 text-white hover:bg-sky-600'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        }`}
      >
        Add To Cart
      </Button>
    </div>
  );
}
