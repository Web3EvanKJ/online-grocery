// components/cart/CartItem.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { CartItem as CartItemType } from '../../lib/types/cart/cart';
import { useCart } from '../../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { refreshCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      await apiClient.updateCartItem(item.id, newQuantity);
      refreshCart(); // Refresh cart using hook
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await apiClient.removeFromCart(item.id);
      refreshCart(); // Refresh cart using hook
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="relative w-20 h-20">
        <Image 
          src={item.product.images[0]?.image_url || '/placeholder-image.jpg'} 
          alt={item.product.name}
          fill
          className="object-cover rounded"
          sizes="80px"
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
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-8 text-center">
          {isUpdating ? '...' : item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          Rp {(item.product.price * item.quantity).toLocaleString()}
        </p>
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-red-500 text-sm hover:text-red-700 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
};