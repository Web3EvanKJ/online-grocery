// hooks/useOrders.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { OrderResponse } from '../lib/types/order/order';

// Define proper type for order data
interface CreateOrderData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  notes?: string;
  payment_method?: string;
}

export const useOrders = (isAdmin = false) => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = isAdmin 
        ? await apiClient.getAdminOrders({ page, limit })
        : await apiClient.getOrders({ page, limit });
      
      // FIX: Access nested data property
      setOrders(response.data?.data || []);
      setPagination(response.data?.pagination || { page, limit, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const createOrder = async (orderData: CreateOrderData) => {
    try {
      const response = await apiClient.createOrder(orderData);
      await fetchOrders(1);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  };

  const cancelOrder = async (orderId: number, reason: string) => {
    try {
      await apiClient.cancelOrder(orderId, reason);
      await fetchOrders(pagination.page);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    cancelOrder,
  };
};