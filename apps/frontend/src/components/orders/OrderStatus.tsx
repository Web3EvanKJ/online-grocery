// components/orders/OrderStatus.tsx
'use client';

interface OrderStatusProps {
  status: string;
}

export const OrderStatus = ({ status }: OrderStatusProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pesanan_Dikonfirmasi':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Dikirim':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Diproses':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Menunggu_Pembayaran':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Menunggu_Konfirmasi_Pembayaran':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};