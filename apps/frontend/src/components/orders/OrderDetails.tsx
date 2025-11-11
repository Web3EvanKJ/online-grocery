// apps/frontend/src/components/orders/OrderDetails.tsx
'use client';

import { Order } from '@/lib/types/order/order';
import { OrderStatus } from './OrderStatus';
import Image from 'next/image';

interface OrderDetailsProps {
  order: Order;
  onCancelOrder?: (orderId: number, reason: string) => void;
  onConfirmOrder?: (orderId: number) => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onCancelOrder,
  onConfirmOrder,
}) => {
  return (
    <div className="space-y-6">
      {/* Order Status */}
      <OrderStatus order={order} />

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detail Items
        </h3>
        
        <div className="space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-b-0">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].image_url}
                    alt={item.product.name}
                    width={56}
                    height={56}
                    className="object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                <p className="text-sm text-gray-600">
                  {item.quantity} x Rp {item.price.toLocaleString()}
                </p>
                {item.discount && item.discount > 0 && (
                  <p className="text-sm text-green-600">
                    Diskon: Rp {item.discount.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ringkasan Pesanan
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              Rp {(order.total_amount - order.shipping_cost).toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Biaya Pengiriman:</span>
            <span>Rp {order.shipping_cost.toLocaleString()}</span>
          </div>
          
          {order.discount_amount && order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon:</span>
              <span>- Rp {order.discount_amount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span>Rp {order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informasi Pengiriman
        </h3>
        
        <div className="space-y-2">
          <div>
            <strong>Metode:</strong> {order.shipping_method.name}
          </div>
          <div>
            <strong>Toko:</strong> {order.store.name}
          </div>
          <div>
            <strong>Alamat:</strong>
            <p className="text-gray-600 mt-1">
              {order.address.address_detail}<br />
              {order.address.district}, {order.address.city}<br />
              {order.address.province}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(order.status === 'Menunggu_Pembayaran' || order.status === 'Dikirim') && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi
          </h3>
          
          <div className="flex gap-3">
            {order.status === 'Menunggu_Pembayaran' && onCancelOrder && (
              <button
                onClick={() => {
                  const reason = prompt('Alasan pembatalan:');
                  if (reason) onCancelOrder(order.id, reason);
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Batalkan Pesanan
              </button>
            )}
            
            {order.status === 'Menunggu_Pembayaran' && (
              <a
                href={`/payment?orderId=${order.id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Bayar Sekarang
              </a>
            )}
            
            {order.status === 'Dikirim' && onConfirmOrder && (
              <button
                onClick={() => onConfirmOrder(order.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Konfirmasi Diterima
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};