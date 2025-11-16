'use client';

import { Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function CartItem({ item }: { item: any }) {
  const { updateCartItem, removeFromCart, updatingIds } = useCartStore();
  const isUpdating = updatingIds.includes(item.id);

  return (
    <div className="flex justify-between items-center p-4">
      <div>
        <p>{item.product.name}</p>
        <p>Rp {item.product.price.toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={isUpdating || item.quantity <= 1}
          onClick={() => updateCartItem(item.id, item.quantity - 1)}
          className="px-2 py-1 border rounded"
        >
          {isUpdating ? <span className="animate-spin">⏳</span> : <Minus />}
        </button>

        <span>{item.quantity}</span>

        <button
          disabled={isUpdating}
          onClick={() => updateCartItem(item.id, item.quantity + 1)}
          className="px-2 py-1 border rounded"
        >
          {isUpdating ? <span className="animate-spin">⏳</span> : <Plus />}
        </button>
      </div>

      <button onClick={() => removeFromCart(item.id)} className="text-red-500">
        Remove
      </button>
    </div>
  );
}
