'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function PurchaseBox({
  stock,
  product_id,
}: {
  stock: number;
  product_id: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!stock || isAdding) return;

    setIsAdding(true);
    try {
      const success = await addToCart(product_id, quantity);
      if (success) {
        console.log('Product added to cart successfully!');
        setQuantity(1); // reset quantity
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

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
        onClick={handleAddToCart}
        disabled={!stock || isAdding || loading}
        className={`w-full rounded-xl py-3 text-base font-semibold transition ${
          stock
            ? 'bg-sky-500 text-white hover:bg-sky-600'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        }`}
      >
        {isAdding || loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
            Adding...
          </>
        ) : (
          'Add To Cart'
        )}
      </Button>
    </div>
  );
}
