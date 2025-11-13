'use client';

interface OrderStatusProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatus = ({ status, size = 'md' }: OrderStatusProps) => {
  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { color: string; label: string; description: string } } = {
      'Menunggu_Pembayaran': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Menunggu Pembayaran',
        description: 'Waiting for payment'
      },
      'Menunggu_Konfirmasi_Pembayaran': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Menunggu Konfirmasi Pembayaran',
        description: 'Payment verification in progress'
      },
      'Diproses': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Diproses',
        description: 'Order is being processed'
      },
      'Dikirim': {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: 'Dikirim',
        description: 'Order has been shipped'
      },
      'Pesanan_Dikonfirmasi': {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Pesanan Dikonfirmasi',
        description: 'Order completed'
      },
      'Dibatalkan': {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Dibatalkan',
        description: 'Order cancelled'
      }
    };

    return configs[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: status.replace(/_/g, ' '),
      description: 'Unknown status'
    };
  };

  const { color, label, description } = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`inline-flex items-center font-medium rounded-full border ${color} ${sizeClasses[size]}`}>
        {label}
      </span>
      <p className="text-xs text-gray-500 text-right">{description}</p>
    </div>
  );
};