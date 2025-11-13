// components/payment/PaymentMethod.tsx
'use client';

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: 'manual_transfer' | 'payment_gateway') => void;
}

export const PaymentMethod = ({ selectedMethod, onMethodChange }: PaymentMethodProps) => {
  const paymentMethods = [
    {
      id: 'manual_transfer',
      name: 'Manual Transfer',
      description: 'Transfer manually and upload proof',
      icon: '🏦'
    },
    {
      id: 'payment_gateway',
      name: 'Payment Gateway',
      description: 'Pay instantly with Midtrans',
      icon: '💳'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Payment Method</h3>
      
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === method.id
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onMethodChange(method.id as 'manual_transfer' | 'payment_gateway')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{method.icon}</span>
            <div className="flex-1">
              <h4 className="font-medium">{method.name}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              selectedMethod === method.id
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'
            }`} />
          </div>
        </div>
      ))}
    </div>
  );
};