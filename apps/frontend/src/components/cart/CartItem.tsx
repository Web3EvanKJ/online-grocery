// components/cart/CartItem.tsx
'use client';
import { CartItem as CartItemType } from '../../lib/types/cart/cart';
import { useCart } from '../../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateCartItem, removeFromCart } = useCart();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(item.id, newQuantity);
  };

  const handleRemove = async () => {
    await removeFromCart(item.id);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <img 
        src={item.product.images[0]?.image_url || '/placeholder-image.jpg'} 
        alt={item.product.name}
        className="w-20 h-20 object-cover rounded"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold">{item.product.name}</h3>
        <p className="text-green-600 font-medium">
          Rp {item.product.price.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
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
          className="text-red-500 text-sm hover:text-red-700 mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
};