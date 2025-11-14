'use client';

import Image from 'next/image';
import { OrderResponse } from '../../lib/types/order/order';
import { OrderStatus } from './OrderStatus';

interface OrderDetailsProps {
  order: OrderResponse;
}

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Order Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <OrderStatus status={order.status} />
        </div>
      </div>

      {/* Order Information Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Shipping Address</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.address?.address_detail}<br />
                {order.address?.subdistrict}, {order.address?.district}<br />
                {order.address?.city}, {order.address?.province}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Shipping Method</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.shipping_method?.name} ({order.shipping_method?.provider})
              </p>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Store Name</p>
              <p className="text-sm text-gray-600 mt-1">{order.store?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Store Address</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.store?.address}<br />
                {order.store?.district}, {order.store?.city}<br />
                {order.store?.province}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b">
              <div className="relative w-16 h-16">
                <Image 
                  src={item.product?.images?.[0]?.image_url || '/placeholder-image.jpg'} 
                  alt={item.product?.name || 'Product image'}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  Rp {parseFloat(item.price.toString()).toLocaleString('id-ID')}
                </p>
                {item.discount && (
                  <p className="text-sm text-green-600">
                    Discount: Rp {parseFloat(item.discount.toString()).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-6 border-t bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>Rp {parseFloat(order.total_amount.toString()).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping Cost</span>
            <span>Rp {parseFloat(order.shipping_cost.toString()).toLocaleString('id-ID')}</span>
          </div>
          {order.discount_amount && (
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <span className="text-green-600">
                -Rp {parseFloat(order.discount_amount.toString()).toLocaleString('id-ID')}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>
              Rp {(
                parseFloat(order.total_amount.toString()) + 
                parseFloat(order.shipping_cost.toString()) - 
                parseFloat(order.discount_amount?.toString() || '0')
              ).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {order.payments && order.payments.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-3">
            {order.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {payment.method === 'manual_transfer' ? 'Manual Transfer' : 'Payment Gateway'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {payment.is_verified ? 'Verified' : 'Pending Verification'}
                  </p>
                  {payment.transaction_id && (
                    <p className="text-sm text-gray-600">
                      Transaction ID: {payment.transaction_id}
                    </p>
                  )}
                </div>
                {payment.proof_image && (
                  <div className="relative w-20 h-20">
                    <Image 
                      src={payment.proof_image} 
                      alt="Payment proof"
                      fill
                      className="object-cover rounded border"
                      sizes="80px"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};