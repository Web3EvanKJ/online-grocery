'use client';

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import LoadingSpinner from '../ui/LoadingSpinner';

type ProductImage = {
  image_url: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  images?: ProductImage[];
};

export type CartItemType = {
  id: number;
  product: Product;
  quantity: number;
};

export function CartItem({ item }: { item: CartItemType }) {
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
              Rp {item.product.price.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold">
              Rp {(item.product.price * item.quantity).toLocaleString()}
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
            {isUpdating ? <LoadingSpinner size="sm" /> : <Minus size={16} />}
          </button>

          <div className="min-w-[2rem] text-center font-medium">{item.quantity}</div>

          <button
            onClick={increase}
            disabled={isUpdating}
            className="w-8 h-8 rounded-md border flex items-center justify-center disabled:opacity-50"
            aria-label="Increase"
          >
            {isUpdating ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
