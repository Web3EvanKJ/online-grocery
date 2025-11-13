'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrderResponse } from '../../lib/types/order/order';

interface OrderCardProps {
  order: OrderResponse;
  isAdmin?: boolean;
  onCancelOrder?: (orderId: number, reason: string) => void;
  isCancelling?: boolean;
}

export const OrderCard = ({ 
  order, 
  isAdmin = false, 
  onCancelOrder,
  isCancelling = false 
}: OrderCardProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancelReason.trim() && onCancelOrder) {
      onCancelOrder(order.id, cancelReason.trim());
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  const canCancel = order.status === 'Menunggu_Pembayaran' || order.status === 'Menunggu_Konfirmasi_Pembayaran';

  return (
    <>
      <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <Link 
                  href={`/orders/${order.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                >
                  Order #{order.id}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.status === 'Pesanan_Dikonfirmasi' ? 'bg-green-100 text-green-800' :
                  order.status === 'Dikirim' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
                  order.status === 'Menunggu_Pembayaran' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Menunggu_Konfirmasi_Pembayaran' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Diproses' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  Rp {parseFloat(order.total_amount.toString()).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Store and Items Info */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Store:</span> {order.store?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Items:</span> {order.order_items?.length || 0} items
              </p>
              {order.shipping_method && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Shipping:</span> {order.shipping_method.name} 
                  (Rp {parseFloat(order.shipping_cost.toString()).toLocaleString('id-ID')})
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/orders/${order.id}`}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              View Details
            </Link>
            
            {!isAdmin && canCancel && onCancelOrder && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isCancelling}
                className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}

            {/* Payment Action */}
            {!isAdmin && order.status === 'Menunggu_Pembayaran' && order.payments?.[0] && (
              <Link
                href={`/payment?orderId=${order.id}`}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Pay Now
              </Link>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2">
                <button className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                  Update Status
                </button>
                <button className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors">
                  Verify Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Order #{order.id}
            </h3>
            
            <form onSubmit={handleCancelSubmit}>
              <div className="mb-4">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation *
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Please provide a reason for cancelling this order..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason.trim() || isCancelling}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};