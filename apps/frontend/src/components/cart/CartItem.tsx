'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

export const CartItem = ({ item }) => {
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const [localQty, setLocalQty] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;

    setLocalQty(newQty); // optimistic
    setLoading(true);

    const success = await updateCartItem(item.id, newQty);
    if (!success) setLocalQty(item.quantity); // rollback

    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeFromCart(item.id);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="relative w-20 h-20">
        <Image
          src={item.product.images[0]?.image_url || '/placeholder-image.jpg'}
          alt={item.product.name}
          fill
          className="object-cover rounded"
        />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{item.product.name}</h3>
        <p className="text-green-600 font-medium">
          Rp {item.product.price.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(localQty - 1)}
          disabled={loading || localQty <= 1}
          className="w-8 h-8 border rounded-full flex items-center justify-center"
        >
          -
        </button>

        <span className="w-8 text-center">{loading ? '...' : localQty}</span>

        <button
          onClick={() => handleQuantityChange(localQty + 1)}
          disabled={loading}
          className="w-8 h-8 border rounded-full flex items-center justify-center"
        >
          +
        </button>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          Rp {(item.product.price * localQty).toLocaleString()}
        </p>

        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-red-500 text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
