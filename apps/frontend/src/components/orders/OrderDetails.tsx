// components/orders/OrderDetails.tsx
'use client';
import { OrderResponse } from '../../lib/types/order/order';
import { OrderStatus } from './OrderStatus';

interface OrderDetailsProps {
  order: OrderResponse;
}

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <OrderStatus status={order.status} />
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-2">
              <img 
                src={item.product.images[0]?.image_url || '/placeholder-image.jpg'} 
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold">
                Rp {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {(order.total_amount - order.shipping_cost).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Rp {order.shipping_cost.toLocaleString()}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>- Rp {order.discount_amount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-semibold text-lg">
            <span>Total</span>
            <span>Rp {order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {order.payments && order.payments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Method</span>
              <span className="capitalize">{order.payments[0].method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={order.payments[0].is_verified ? 'text-green-600' : 'text-orange-600'}>
                {order.payments[0].is_verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};