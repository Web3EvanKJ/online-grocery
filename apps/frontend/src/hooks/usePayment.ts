import { useState } from 'react';
import { apiClient } from '../lib/api';
import { MidtransPaymentResponse } from '../lib/types/payment/payment';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMidtransPayment = async (
    orderId: number, 
    paymentMethod: string
  ): Promise<MidtransPaymentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.initializeMidtransPayment(orderId, paymentMethod);
      // FIX: Access nested data property
      const paymentData = response.data?.data as MidtransPaymentResponse;
      
      return paymentData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Midtrans payment initialization failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadManualPaymentProof = async (orderId: number, proofImage: File): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.uploadManualPayment(orderId, proofImage);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload payment proof';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatus = async (transactionId: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPaymentStatus(transactionId);
      // FIX: Access nested data property
      return response.data?.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get payment status';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Keep createPayment for backward compatibility if needed
  const createPayment = async (orderData: any): Promise<MidtransPaymentResponse | null> => {
    return initializeMidtransPayment(orderData.order_id, orderData.payment_method);
  };

  return {
    // Main methods
    initializeMidtransPayment,
    uploadManualPaymentProof,
    getPaymentStatus,
    
    // Legacy method (optional)
    createPayment,
    
    // State
    isLoading,
    error,
    clearError: () => setError(null),
  };
};