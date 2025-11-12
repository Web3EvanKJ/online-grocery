// apps/frontend/src/components/cart/CartItem.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/lib/types/cart/cart';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (cartId: number, quantity: number) => void;
  onRemove: (cartId: number) => void;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 100) return;
    
    setIsUpdating(true);
    setQuantity(newQuantity);
    
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch {
      // Revert on error
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  const productImage = item.product.images[0]?.image_url || '/images/placeholder-product.jpg';
  const totalPrice = item.product.price * quantity;
  const isAvailable = item.product.isAvailable;

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <div className="flex-shrink-0">
        <Image
          src={productImage}
          alt={item.product.name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {item.product.name}
        </h3>
        
        <p className="text-gray-600 mt-1">
          Rp {item.product.price.toLocaleString()}
        </p>
        
        {!isAvailable && (
          <p className="text-red-600 text-sm mt-1">
            Stok tidak mencukupi
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isUpdating}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50"
          >
            -
          </button>
          
          <span className="w-12 text-center font-medium">
            {quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= 100 || isUpdating || !isAvailable}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          Rp {totalPrice.toLocaleString()}
        </p>
        
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-800 text-sm mt-2 disabled:opacity-50"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};