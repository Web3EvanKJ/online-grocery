// apps/frontend/src/components/orders/OrderStatus.tsx
'use client';

import { Order } from '@/lib/types/order/order';

interface OrderStatusProps {
  order: Order;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const statusSteps = [
    { key: 'Menunggu_Pembayaran', label: 'Menunggu Pembayaran' },
    { key: 'Menunggu_Konfirmasi_Pembayaran', label: 'Menunggu Konfirmasi' },
    { key: 'Diproses', label: 'Diproses' },
    { key: 'Dikirim', label: 'Dikirim' },
    { key: 'Pesanan_Dikonfirmasi', label: 'Selesai' },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Status Pesanan
      </h3>
      
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isCancelled = order.status === 'Dibatalkan';

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isCancelled
                    ? 'bg-red-100 border-red-500 text-red-500'
                    : isCompleted
                    ? 'bg-green-100 border-green-500 text-green-500'
                    : isCurrent
                    ? 'bg-blue-100 border-blue-500 text-blue-500'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {isCancelled ? (
                  <span>✕</span>
                ) : isCompleted ? (
                  <span>✓</span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCancelled
                      ? 'text-red-600'
                      : isCompleted
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                
                {isCurrent && !isCancelled && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pesanan Anda sedang dalam tahap ini
                  </p>
                )}
                
                {isCancelled && index === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Pesanan telah dibatalkan
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};