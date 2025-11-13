'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define proper type for order data
interface OrderData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
  notes?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, loading: cartLoading, refreshCart } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrder = async (orderData: OrderData) => {
    try {
      setError(null);
      const response = await createOrder(orderData);
      
      // Proper null/undefined check
      if (response?.data?.id) {
        await refreshCart();
        router.push(`/payment?orderId=${response.data.id}`);
      } else {
        throw new Error('Failed to create order: No order ID received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
    }
  };

  // Redirect if cart empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.length === 0)) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return null; // Will redirect in useEffect
  }

  const isLoading = cartLoading || orderLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <CheckoutForm 
                onSubmit={handleCreateOrder}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:w-1/3">
            <OrderSummary 
              cartItems={cart}
              cartTotal={cartTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}