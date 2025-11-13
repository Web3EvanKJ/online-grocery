'use client';

interface PaymentMethodSelectorProps {
  selectedMethod: 'manual_transfer' | 'payment_gateway';
  onMethodChange: (method: 'manual_transfer' | 'payment_gateway') => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'manual_transfer',
      name: 'Manual Transfer',
      description: 'Transfer bank manual dan upload bukti transfer',
      banks: [
        { name: 'BCA', account: '1234567890', holder: 'Online Grocery Store' },
        { name: 'BNI', account: '0987654321', holder: 'Online Grocery Store' },
        { name: 'Mandiri', account: '1122334455', holder: 'Online Grocery Store' }
      ]
    },
    {
      id: 'payment_gateway',
      name: 'Payment Gateway',
      description: 'Bayar dengan Midtrans (Credit Card, E-Wallet, Bank Transfer)',
      features: ['Credit Card', 'Gopay', 'ShopeePay', 'Bank Transfer']
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onMethodChange(method.id as any)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    
                    {/* Bank Details for Manual Transfer */}
                    {method.id === 'manual_transfer' && selectedMethod === 'manual_transfer' && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Transfer ke rekening:</p>
                        {method.banks?.map((bank, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                            <span className="font-medium">{bank.name}</span>: {bank.account} a.n {bank.holder}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Features for Payment Gateway */}
                    {method.id === 'payment_gateway' && selectedMethod === 'payment_gateway' && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Supported methods:</p>
                        <div className="flex flex-wrap gap-2">
                          {method.features?.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}