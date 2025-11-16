'use client';
import { useEffect } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MidtransPaymentPage() {
  const { orderId, method, transactionId } = usePaymentStore();
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;

    const initPayment = async () => {
      try {
        const payment = await apiClient.getPaymentStatus(orderId);

        // Kalau sudah verified langsung ke orders page
        if (payment.is_verified) {
          router.push(`/orders/${orderId}`);
          return;
        }

        // Redirect ke Midtrans jika ada URL
        if (payment.redirect_url) {
          window.location.href = payment.redirect_url;
        }
      } catch (err) {
        console.error('Midtrans payment init failed:', err);
        router.push('/orders');
      }
    };

    initPayment();
  }, [orderId, method, transactionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-700">Redirecting to payment...</p>
      </div>
    </div>
  );
}
