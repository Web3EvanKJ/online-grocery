'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

export function PurchaseBox() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-5 rounded-sm border border-blue-200 bg-white p-5">
      {/* Quantity control */}
      <div>
        <p className="mb-2 font-semibold text-gray-800">Jumlah Pembelian</p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded-full border-blue-300 text-blue-600"
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
            className="h-8 w-8 rounded-full border-blue-300 text-blue-600"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to cart */}
      <Button className="w-full rounded-xl bg-blue-500 py-3 text-base font-semibold text-white hover:bg-blue-600">
        + Keranjang
      </Button>
    </div>
  );
}
