// apps/frontend/src/app/payment/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/usePayment';
import { PaymentMethodComponent } from '@/components/payment/PaymentMethod';
import { PaymentProof } from '@/components/payment/PaymentProof';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { createMidtransTransaction, uploadPaymentProof, loading, error } = usePayment();

  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'manual_transfer' | 'payment_gateway'>('manual_transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(parseInt(orderIdParam));
    } else {
      router.push('/orders');
    }
  }, [searchParams, router]);

  const handleMidtransPayment = async () => {
    if (!orderId) return;

    try {
      setIsProcessing(true);
      const transaction = await createMidtransTransaction(orderId);
      
      // Redirect to Midtrans payment page
      window.location.href = transaction.redirect_url;
    } catch (err) {
      console.error('Failed to create payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPayment = async (file: File) => {
    if (!orderId) return;

    try {
      await uploadPaymentProof({
        orderId,
        proofImage: file,
      });
      
      // Redirect to orders page with success message
      router.push('/orders?payment=success');
    } catch (err) {
      console.error('Failed to upload payment proof:', err);
    }
  };

  const handleProceedPayment = () => {
    if (paymentMethod === 'payment_gateway') {
      handleMidtransPayment();
    }
    // For manual transfer, user needs to upload proof
  };

  const handleMethodChange = (method: 'manual_transfer' | 'payment_gateway') => {
    setPaymentMethod(method);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Order ID tidak valid
            </h2>
            <button
              onClick={() => router.push('/orders')}
              className="text-blue-600 hover:text-blue-800 mt-4"
            >
              Kembali ke Daftar Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Pembayaran Pesanan #{orderId}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PaymentMethodComponent
              methods={[]} // You can fetch available methods if needed
              selectedMethod={paymentMethod}
              onMethodChange={handleMethodChange}
            />

            {paymentMethod === 'manual_transfer' && (
              <PaymentProof
                onProofUpload={handleManualPayment}
                isLoading={loading}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ringkasan
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Order ID:</span>
                  <span className="font-medium">#{orderId}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Metode Pembayaran:</span>
                  <span className="font-medium capitalize">
                    {paymentMethod.replace('_', ' ')}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {paymentMethod === 'payment_gateway'
                      ? 'Anda akan diarahkan ke halaman pembayaran Midtrans'
                      : 'Upload bukti transfer setelah melakukan pembayaran'}
                  </p>
                </div>
              </div>

              {paymentMethod === 'payment_gateway' && (
                <button
                  onClick={handleProceedPayment}
                  disabled={isProcessing || loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-4"
                >
                  {isProcessing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}