'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/store/cartStore';
import { useOrders } from '@/hooks/useOrders';
import { apiClient } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { createOrder, loading: orderLoading } = useOrders();
  const { cart, cartTotal, fetchCart, loading: cartLoading } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('midtrans');
  const [error, setError] = useState<string | null>(null);

  const [shippingCost, setShippingCost] = useState<number>(0);

  // Fetch cart
  useEffect(() => { fetchCart(); }, [fetchCart]);

  // Redirect if cart empty
  useEffect(() => {
    if (!cartLoading && cart.length === 0) router.push('/cart');
  }, [cartLoading, cart, router]);

  // Prepare items for shipping calculation
  const itemsForShipping = useMemo(() => cart.map(it => ({
    product_id: it.product_id ?? it.product.id,
    quantity: it.quantity,
    weight: 100
  })), [cart]);

  // Update shipping cost whenever address or shipping method changes
  useEffect(() => {
    const fetchShippingCost = async () => {
      if (!selectedAddressId || !selectedShippingMethodId) return;
      try {
        const res = await apiClient.calculateShippingCost({
          addressId: selectedAddressId,
          shippingMethodId: selectedShippingMethodId,
          items: itemsForShipping
        });
        setShippingCost(res.data.cost);
      } catch (err) {
        console.error('Failed to calculate shipping cost', err);
        setShippingCost(0);
      }
    };
    fetchShippingCost();
  }, [selectedAddressId, selectedShippingMethodId, itemsForShipping]);

  const handleCreateOrder = async (formData: any) => {
    try {
      setError(null);
      const payload = { ...formData, payment_method: paymentMethod };
      const response = await createOrder(payload);
      if (!response?.data?.id) throw new Error('Failed to create order');

      try {
        const init = await apiClient.initializeMidtransPayment(response.data.id, paymentMethod);
        const redirectUrl = (init as any)?.data?.payment_url || (init as any)?.data?.redirect_url || (init as any)?.data?.token;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
      } catch (err) { console.warn('Payment initialization failed', err); }

      await fetchCart();
      router.push(`/payment?orderId=${response.data.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create order');
    }
  };

  if (cartLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!cart || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

              <CheckoutForm
                onSubmit={handleCreateOrder}
                isLoading={cartLoading || orderLoading}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                selectedShippingMethodId={selectedShippingMethodId}
                setSelectedShippingMethodId={setSelectedShippingMethodId}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            </div>
          </div>

          <div className="lg:w-1/3">
            <OrderSummary
              cartItems={cart}
              cartTotal={cartTotal}
              selectedAddressId={selectedAddressId}
              selectedShippingMethodId={selectedShippingMethodId}
              itemsForShipping={itemsForShipping}
              shippingCost={shippingCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}