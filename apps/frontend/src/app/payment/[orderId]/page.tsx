'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentStore } from '@/store/paymentStore';
import MidtransPaymentPage from '@/components/payment/MidtransPayment';
import ManualPaymentPage from '@/components/payment/ManualTransferPayment';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/lib/api';

interface PaymentWrapperProps {
  params: { orderId: string };
}

export default function PaymentWrapper({ params }: PaymentWrapperProps) {
  const router = useRouter();
  const { orderId } = params;
  const { method, setPayment } = usePaymentStore();

  useEffect(() => {
    const init = async () => {
      if (!method) {
        try {
          const payment = await apiClient.getPaymentStatus(Number(orderId));

          // Set payment info di store
          setPayment(
            Number(orderId),
            payment.method,
            payment.transaction_id || null,
            payment.is_verified ? 'verified' : 'pending'
          );

          // Kalau payment gateway dan sudah ada redirectUrl, langsung redirect
          if (
            payment.method === 'payment_gateway' &&
            payment.redirect_url
          ) {
            window.location.href = payment.redirect_url;
            return;
          }
        } catch (err) {
          console.error('Failed to fetch payment:', err);
          router.push('/orders');
        }
      }
    };
    init();
  }, [orderId, method, setPayment, router]);

  if (!method) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (method === 'payment_gateway') return <MidtransPaymentPage />;
  if (method === 'manual_transfer') return <ManualPaymentPage />;

  return <p>Unsupported payment method</p>;
}
