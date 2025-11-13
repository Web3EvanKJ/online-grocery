'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { OrderResponse } from '@/lib/types/order/order';
import { OrderDetails } from '@/components/orders/OrderDetails';
import { OrderStatus } from '@/components/orders/OrderStatus';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getOrderById(parseInt(orderId));
      
      if (response.data?.data) {
        setOrder(response.data.data);
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleCancelOrder = async (reason: string) => {
    if (!order) return false;

    try {
      await apiClient.cancelOrder(order.id, reason);
      // Refresh order data
      await fetchOrder();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? 'Error Loading Order' : 'Order Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || `Order #${orderId} was not found.`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/orders"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>

        {/* Order Details */}
        <OrderDetails order={order} />

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          {/* Pay Button for pending payment */}
          {order.status === 'Menunggu_Pembayaran' && (
            <Link
              href={`/payment?orderId=${order.id}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
            >
              Pay Now
            </Link>
          )}

          {/* Cancel Button for cancellable orders */}
          {(order.status === 'Menunggu_Pembayaran' || order.status === 'Menunggu_Konfirmasi_Pembayaran') && (
            <button
              onClick={async () => {
                const reason = prompt('Please provide a reason for cancellation:');
                if (reason && reason.trim()) {
                  const success = await handleCancelOrder(reason.trim());
                  if (success) {
                    alert('Order cancelled successfully');
                  }
                }
              }}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Cancel Order
            </button>
          )}

          {/* Track Order Button for shipped orders */}
          {order.status === 'Dikirim' && (
            <button
              onClick={() => {
                // TODO: Implement order tracking
                alert('Order tracking feature coming soon!');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Track Order
            </button>
          )}

          {/* Contact Support Button */}
          <button
            onClick={() => {
              // TODO: Implement contact support
              alert('Contact support feature coming soon!');
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Contact Support
          </button>
        </div>

        {/* Order Timeline */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
          <div className="space-y-4">
            {/* Order Created */}
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Order Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-2 ${
                order.status === 'Menunggu_Pembayaran' ? 'bg-yellow-500' :
                order.status === 'Menunggu_Konfirmasi_Pembayaran' ? 'bg-blue-500' :
                ['Diproses', 'Dikirim', 'Pesanan_Dikonfirmasi'].includes(order.status) ? 'bg-green-500' :
                'bg-gray-300'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {order.status === 'Menunggu_Pembayaran' && 'Waiting for Payment'}
                  {order.status === 'Menunggu_Konfirmasi_Pembayaran' && 'Payment Verification'}
                  {['Diproses', 'Dikirim', 'Pesanan_Dikonfirmasi'].includes(order.status) && 'Payment Confirmed'}
                  {order.status === 'Dibatalkan' && 'Payment Cancelled'}
                </p>
                <p className="text-sm text-gray-600">
                  {order.status === 'Menunggu_Pembayaran' && 'Complete your payment to proceed'}
                  {order.status === 'Menunggu_Konfirmasi_Pembayaran' && 'We are verifying your payment'}
                  {['Diproses', 'Dikirim', 'Pesanan_Dikonfirmasi'].includes(order.status) && 'Payment has been confirmed'}
                  {order.status === 'Dibatalkan' && 'Order has been cancelled'}
                </p>
              </div>
            </div>

            {/* Processing Status */}
            {['Diproses', 'Dikirim', 'Pesanan_Dikonfirmasi'].includes(order.status) && (
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  order.status === 'Diproses' ? 'bg-purple-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {order.status === 'Diproses' ? 'Order Processing' : 'Order Processed'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.status === 'Diproses' 
                      ? 'Store is preparing your order' 
                      : 'Order has been processed and ready for shipping'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Shipping Status */}
            {['Dikirim', 'Pesanan_Dikonfirmasi'].includes(order.status) && (
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  order.status === 'Dikirim' ? 'bg-indigo-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {order.status === 'Dikirim' ? 'Order Shipped' : 'Order Delivered'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.status === 'Dikirim' 
                      ? 'Your order is on the way' 
                      : 'Order has been delivered successfully'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Completed Status */}
            {order.status === 'Pesanan_Dikonfirmasi' && (
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Order Completed</p>
                  <p className="text-sm text-gray-600">
                    Thank you for your purchase!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}