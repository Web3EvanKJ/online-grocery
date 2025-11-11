// apps/frontend/src/components/orders/OrderCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/types/order/order';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      Menunggu_Pembayaran: 'bg-yellow-100 text-yellow-800',
      Menunggu_Konfirmasi_Pembayaran: 'bg-blue-100 text-blue-800',
      Diproses: 'bg-purple-100 text-purple-800',
      Dikirim: 'bg-indigo-100 text-indigo-800',
      Pesanan_Dikonfirmasi: 'bg-green-100 text-green-800',
      Dibatalkan: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts: { [key: string]: string } = {
      Menunggu_Pembayaran: 'Menunggu Pembayaran',
      Menunggu_Konfirmasi_Pembayaran: 'Menunggu Konfirmasi',
      Diproses: 'Diproses',
      Dikirim: 'Dikirim',
      Pesanan_Dikonfirmasi: 'Selesai',
      Dibatalkan: 'Dibatalkan',
    };
    return statusTexts[status] || status;
  };

  const itemCount = order.order_items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.id}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {formatDate(order.created_at)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {order.order_items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0].image_url}
                  alt={item.product.name}
                  width={40}
                  height={40}
                  className="object-cover rounded"
                />
              ) : (
                <span className="text-gray-400 text-xs">No Image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product.name}
              </p>
              <p className="text-sm text-gray-600">
                {item.quantity} x Rp {item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        
        {order.order_items.length > 2 && (
          <p className="text-sm text-gray-600">
            +{order.order_items.length - 2} item lainnya
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">{itemCount} items</p>
          <p className="text-lg font-semibold text-gray-900">
            Rp {order.total_amount.toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`/orders/${order.id}`}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Detail
          </Link>
          
          {order.status === 'Menunggu_Pembayaran' && (
            <Link
              href={`/payment?orderId=${order.id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Bayar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};