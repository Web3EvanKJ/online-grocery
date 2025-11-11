'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { CartItemComponent } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    loading,
    error,
    cartTotal,
    cartCount,
    updateCartItem,
    removeFromCart,
    refreshCart,
  } = useCart();
  
  const setCartCount = useCartStore((state) => state.setCartCount);

  // Sync cart count with store
  useEffect(() => {
    setCartCount(cartCount);
  }, [cartCount, setCartCount]);

  const handleUpdateQuantity = async (cartId: number, quantity: number) => {
    try {
      await updateCartItem(cartId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    try {
      await removeFromCart(cartId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={refreshCart}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Keranjang Belanja
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {cart.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <CartSummary
              total={cartTotal}
              itemCount={cartCount}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}