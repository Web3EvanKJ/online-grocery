import { useState } from 'react';
import { apiClient } from '../lib/api';
import { MidtransPaymentResponse } from '../lib/types/payment/payment';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (orderData: any): Promise<MidtransPaymentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // FIX: Extract data from the API response
      const response = await apiClient.createPayment(orderData);
      const paymentData = response.data?.data as MidtransPaymentResponse;
      
      return paymentData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment creation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatus = async (transactionId: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPaymentStatus(transactionId);
      // FIX: Extract data from the API response
      return response.data?.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get payment status';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    getPaymentStatus,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};