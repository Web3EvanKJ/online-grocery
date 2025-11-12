'use client';

interface CartSummaryProps {
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isLoading?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  total,
  itemCount,
  onCheckout,
  isLoading = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Ringkasan Belanja</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Total Items:</span>
          <span>{itemCount} items</span>
        </div>
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total Harga:</span>
          <span>Rp {total.toLocaleString()}</span>
        </div>
      </div>
      
      <button
        onClick={onCheckout}
        disabled={itemCount === 0 || isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Memproses...' : 'Lanjut ke Checkout'}
      </button>
    </div>
  );
};