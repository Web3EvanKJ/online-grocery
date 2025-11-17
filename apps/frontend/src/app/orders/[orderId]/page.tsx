'use client';

import { useEffect, useState } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/format';

// Interface untuk order item
interface OrderItem {
  id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

// Interface untuk order details
interface OrderDetails {
  id: number;
  status: string;
  total_amount: number;
  payment_method: string;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Number(params.orderId);

  const { orderDetails, getOrderById, confirmOrderDelivery, cancelOrder } = useOrdersStore();

  const [cancelReason, setCancelReason] = useState('');
  const [cancelInput, setCancelInput] = useState(false);

  useEffect(() => {
    if (!isNaN(orderId)) {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason');
      return;
    }
    try {
      await cancelOrder(orderId, cancelReason);
      setCancelInput(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
    }
    router.push('/orders');
  };

  const handleConfirmDelivery = async () => {
    try {
      await confirmOrderDelivery(orderId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!orderDetails) {
    return <p className="p-4 text-center">Loading order details...</p>;
  }

  const order = orderDetails as OrderDetails;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>

      <div className="border rounded p-4 mb-4">
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> {formatPrice(order.total_amount)}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        <p><strong>Created At:</strong> {formatDate(order.createdAt)}</p>
        {order.updatedAt && <p><strong>Updated At:</strong> {formatDate(order.updatedAt)}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {/* Cancel */}
        {['Pending', 'Menunggu_Pembayaran'].includes(order.status) && (
          <>
            {!cancelInput ? (
              <button
                onClick={() => setCancelInput(true)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel Order
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="border p-2 rounded flex-1"
                />
                <button
                  onClick={handleCancel}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setCancelInput(false); setCancelReason(''); }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}

        {/* Confirm Delivery */}
        {order.status === 'Dikirim' && (
          <button
            onClick={handleConfirmDelivery}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Confirm Delivery
          </button>
        )}
      </div>

      {/* Optional: tampilkan daftar produk dalam order */}
      {order.items && order.items.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <ul className="space-y-2">
            {order.items.map((item: OrderItem) => (
              <li key={item.id} className="border rounded p-2 flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>{formatPrice(item.quantity * Number(item.product.price))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}