'use client';

import { useEffect, useState } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import { usePaymentStore } from '@/store/paymentStore';
import { useRouter } from 'next/navigation';
import ManualPaymentPage from '@/components/payment/ManualTransferPayment';
import MidtransPaymentPage from '@/components/payment/MidtransPayment';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface OrderDetailPageProps {
  params: { orderId: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = params;
  const router = useRouter();
  const { orderDetails, getOrderById, cancelOrder, loading, error } = useOrdersStore();
  const { method, setPayment } = usePaymentStore();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await getOrderById(Number(orderId));

        if (orderDetails && !method) {
          setPayment(orderDetails.id, orderDetails.payment_method, orderDetails.transaction_id || null);
        }

        setReady(true);
      } catch (err) {
        console.error(err);
        router.push('/orders');
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orderDetails) {
    return <p className="text-center py-10">Order not found</p>;
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrder(orderDetails.id, 'User cancelled order');
      router.push('/orders');
    } catch (err) {
      console.error(err);
      alert('Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Order #{orderDetails.id}</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p>Total: Rp {Number(orderDetails.total_amount).toLocaleString()}</p>
          <p>Status: {orderDetails.payment_status || 'Pending'}</p>
          <p>Created At: {new Date(orderDetails.created_at).toLocaleString()}</p>

          {orderDetails.payment_status === 'pending' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Payment Component */}
        {method === 'payment_gateway' && <MidtransPaymentPage />}
        {method === 'manual_transfer' && <ManualPaymentPage />}
      </div>
    </div>
  );
}
