// apps/frontend/src/hooks/usePayment.ts
import { useState } from 'react';
import { PaymentMethod, MidtransTransaction, UploadPaymentRequest } from '@/lib/types/payment/payment';
import { apiClient } from '@/lib/api';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getShippingMethods = async (): Promise<PaymentMethod[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getShippingMethods();
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping methods');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createMidtransTransaction = async (orderId: number): Promise<MidtransTransaction> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createMidtransTransaction(orderId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPaymentProof = async (data: UploadPaymentRequest) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.uploadPaymentProof(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload payment proof');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getShippingMethods,
    createMidtransTransaction,
    uploadPaymentProof,
  };
};