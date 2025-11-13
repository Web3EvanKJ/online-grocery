// components/orders/OrderCard.tsx
'use client';
import { OrderResponse } from '../../lib/types/order/order';

interface OrderCardProps {
  order: OrderResponse;
  isAdmin?: boolean;
}

export const OrderCard = ({ order, isAdmin = false }: OrderCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-sm ${
          order.status === 'Pesanan_Dikonfirmasi' ? 'bg-green-100 text-green-800' :
          order.status === 'Dikirim' ? 'bg-blue-100 text-blue-800' :
          order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>
      
      <div className="mb-2">
        <p className="font-medium">Total: Rp {order.total_amount.toLocaleString()}</p>
        <p className="text-sm">Shipping: Rp {order.shipping_cost.toLocaleString()}</p>
      </div>

      <div className="text-sm">
        <p>Items: {order.order_items.length} products</p>
        {isAdmin && (
          <div className="mt-2 space-x-2">
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
              Update Status
            </button>
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
              Verify Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};