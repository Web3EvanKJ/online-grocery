'use client';
import { useEffect } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const { orders, loading, getOrders, error } = useOrdersStore();
  const router = useRouter();

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Orders</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {orders || length === 0 ? (
          <p className="text-gray-600 text-center py-10">You have no orders yet.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="p-4 border rounded-lg bg-white shadow cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">Order #{order.id}</p>
                  <span
                    className={`font-semibold ${
                      order.status === 'pending'
                        ? 'text-blue-600'
                        : order.status === 'verified'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Payment: {order.payment_method}</p>
                  <p>Total: Rp {order.total_amount.toLocaleString()}</p>
                  <p>Created at: {new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
