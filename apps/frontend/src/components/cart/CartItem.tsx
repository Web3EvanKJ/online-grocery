// apps/frontend/src/components/cart/CartItem.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function CartItem({ item }: { item: any }) {
  const updateCartItem = useCartStore(state => state.updateCartItem);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updatingIds = useCartStore(state => state.updatingIds);

  const isUpdating = updatingIds.includes(item.id);

  const decrease = () => {
    if (item.quantity <= 1 || isUpdating) return;
    updateCartItem(item.id, item.quantity - 1);
  };

  const increase = () => {
    if (isUpdating) return;
    updateCartItem(item.id, item.quantity + 1);
  };

  const remove = () => {
    if (isUpdating) return;
    removeFromCart(item.id);
  };

  const imageUrl = item?.product?.images?.[0]?.image_url;

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          // next/image might need domain config; fallback to img if not configured
          <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
            <div className="text-xs text-gray-500 mt-1">
              Rp {Number(item.product.price).toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold">
              Rp {(Number(item.product.price) * item.quantity).toLocaleString()}
            </div>
            <button onClick={remove} className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={decrease}
            disabled={isUpdating || item.quantity <= 1}
            className="w-8 h-8 rounded-md border flex items-center justify-center disabled:opacity-50"
            aria-label="Decrease"
          >
            {isUpdating ? <span className="animate-spin">⏳</span> : <Minus size={16} />}
          </button>

          <div className="min-w-[2rem] text-center font-medium">{item.quantity}</div>

          <button
            onClick={increase}
            disabled={isUpdating}
            className="w-8 h-8 rounded-md border flex items-center justify-center disabled:opacity-50"
            aria-label="Increase"
          >
            {isUpdating ? <span className="animate-spin">⏳</span> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
