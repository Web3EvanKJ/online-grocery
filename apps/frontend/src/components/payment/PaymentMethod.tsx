// apps/frontend/src/components/payment/PaymentMethod.tsx
'use client';

import { PaymentMethod as PaymentMethodType } from '@/lib/types/payment/payment';

interface PaymentMethodProps {
  methods: PaymentMethodType[];
  selectedMethod: 'manual_transfer' | 'payment_gateway';
  onMethodChange: (method: 'manual_transfer' | 'payment_gateway') => void;
}

export const PaymentMethodComponent: React.FC<PaymentMethodProps> = ({
//   methods,
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Metode Pembayaran
      </h3>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="paymentMethod"
            value="manual_transfer"
            checked={selectedMethod === 'manual_transfer'}
            onChange={() => onMethodChange('manual_transfer')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">Transfer Manual</span>
            <p className="text-sm text-gray-600 mt-1">
              Transfer ke rekening bank dan upload bukti transfer
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="paymentMethod"
            value="payment_gateway"
            checked={selectedMethod === 'payment_gateway'}
            onChange={() => onMethodChange('payment_gateway')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">Payment Gateway</span>
            <p className="text-sm text-gray-600 mt-1">
              Bayar secara online melalui Midtrans (Credit Card, E-Wallet, dll)
            </p>
          </div>
        </label>
      </div>

      {selectedMethod === 'manual_transfer' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Instruksi Transfer Manual
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Transfer ke rekening BCA: 1234567890 (Online Grocery Store)</li>
            <li>• Jumlah transfer: Sesuai total pesanan</li>
            <li>• Upload bukti transfer setelah melakukan pembayaran</li>
            <li>• Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
          </ul>
        </div>
      )}

      {selectedMethod === 'payment_gateway' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">
            Instruksi Payment Gateway
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Anda akan diarahkan ke halaman pembayaran Midtrans</li>
            <li>• Pilih metode pembayaran yang diinginkan</li>
            <li>• Ikuti instruksi untuk menyelesaikan pembayaran</li>
            <li>• Pesanan akan otomatis diproses setelah pembayaran berhasil</li>
          </ul>
        </div>
      )}
    </div>
  );
};