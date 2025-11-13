'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePayment } from '@/hooks/usePayment';
import PaymentMethodSelector from '@/components/payment/PaymentMethod';
import ManualPaymentUpload from '@/components/payment/PaymentProof';
import MidtransPayment from '@/components/payment/MidtransPayment';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type PaymentMethod = 'manual_transfer' | 'payment_gateway';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const { 
    initializeMidtransPayment, 
    uploadManualPaymentProof, 
    isLoading, 
    error 
  } = usePayment();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('manual_transfer');
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [midtransData, setMidtransData] = useState<any>(null);

  const handleManualPayment = async (proofImage: File) => {
    if (!orderId) return false;
    
    const success = await uploadManualPaymentProof(parseInt(orderId), proofImage);
    if (success) {
      // Redirect to orders page or show success message
      window.location.href = '/orders';
    }
    return success;
  };

  const handleMidtransPayment = async () => {
    if (!orderId) return;
    
    try {
      const paymentData = await initializeMidtransPayment(
        parseInt(orderId), 
        'bank_transfer' // atau payment method lain
      );
      
      if (paymentData) {
        setMidtransData(paymentData);
        setPaymentInitialized(true);
        
        // Redirect to Midtrans payment page
        if (paymentData.payment_url) {
          window.location.href = paymentData.payment_url;
        }
      }
    } catch (err) {
      console.error('Midtrans payment error:', err);
    }
  };

  // Redirect if no orderId
  useEffect(() => {
    if (!orderId) {
      window.location.href = '/orders';
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600 mb-6">Order ID: #{orderId}</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
            disabled={isLoading || paymentInitialized}
          />

          {/* Payment Content */}
          <div className="mt-8">
            {selectedMethod === 'manual_transfer' && (
              <ManualPaymentUpload
                onSubmit={handleManualPayment}
                isLoading={isLoading}
              />
            )}

            {selectedMethod === 'payment_gateway' && (
              <MidtransPayment
                onInitialize={handleMidtransPayment}
                isLoading={isLoading}
                isInitialized={paymentInitialized}
                paymentData={midtransData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}