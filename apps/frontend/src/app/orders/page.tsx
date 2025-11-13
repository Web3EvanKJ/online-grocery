'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OrdersPage() {
  const { orders, loading, error, pagination, fetchOrders, cancelOrder } = useOrders();
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  const handleCancelOrder = async (orderId: number, reason: string) => {
    setCancellingOrderId(orderId);
    try {
      const success = await cancelOrder(orderId, reason);
      if (success) {
        // Success handled in the hook via refetch
        console.log('Order cancelled successfully');
      }
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage, pagination.limit);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">
                  Track and manage your orders
                </p>
              </div>
              <Link
                href="/"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Orders List */}
          <div className="divide-y">
            {orders.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancelOrder={handleCancelOrder}
                  isCancelling={cancellingOrderId === order.id}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay for pagination */}
          {loading && orders.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}