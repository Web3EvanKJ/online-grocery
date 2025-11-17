'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/store/cartStore';
import { useOrdersStore } from '@/store/ordersStore';
import { usePaymentStore } from '@/store/paymentStore';
import { apiClient } from '@/lib/api';

// tipe untuk orderData
interface OrderData {
  addressId: number;
  shippingMethodId: number;
  voucherCode?: string;
  notes?: string;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
}

// tipe order result dari createOrder
interface OrderResult {
  id: number;
}

// Tipe untuk snap result
interface SnapResult {
  transactionId: string;
  redirectUrl: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, loading: cartLoading, fetchCart, clearCart } = useCartStore();
  const { createOrder, loading: orderLoading } = useOrdersStore();
  const { setPayment } = usePaymentStore();

  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>();
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<'manual_transfer' | 'payment_gateway'>('payment_gateway');
  const [voucherCode, setVoucherCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    if (!selectedAddressId || !selectedShippingMethodId || items.length === 0) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setError(null);

      const orderData: OrderData = {
        addressId: selectedAddressId,
        shippingMethodId: selectedShippingMethodId,
        voucherCode: voucherCode || undefined,
        notes: notes || undefined,
        paymentMethod,
      };

      const order: OrderResult = await createOrder(orderData);

      await clearCart();

      // Set payment info in store
      setPayment(order.id, paymentMethod);

      if (paymentMethod === 'payment_gateway') {
        const snapResult: SnapResult = await apiClient.initializeMidtransPayment(order.id);
        // pastikan snapResult memiliki transactionId & redirectUrl
        setPayment(order.id, 'gopay', snapResult.transactionId);
        window.location.href = snapResult.redirectUrl;
      } else {
        router.push(`/payment/${order.id}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order.';
      setError(errorMessage);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cart empty
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg text-blue-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <CheckoutForm
              onAddressChange={setSelectedAddressId}
              onShippingChange={setSelectedShippingMethodId}
              onPaymentMethodChange={setPaymentMethod}
              selectedAddressId={selectedAddressId}
              selectedShippingMethodId={selectedShippingMethodId}
              paymentMethod={paymentMethod}
              voucherCode={voucherCode}
              onVoucherCodeChange={setVoucherCode}
              notes={notes}
              onNotesChange={setNotes}
            />
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleCheckout}
                disabled={orderLoading || !selectedAddressId || !selectedShippingMethodId}
                className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {orderLoading ? <LoadingSpinner size="sm" /> : 'Place Order'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={items}
              selectedAddressId={selectedAddressId}
              selectedShippingMethodId={selectedShippingMethodId}
              voucherCode={voucherCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}