// apps/frontend/src/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { Order, CreateOrderRequest } from '@/lib/types/order/order';
import { apiClient } from '@/lib/api';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getOrders(page, limit);
      setOrders(response.data);
      setPagination(response.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createOrder(data);
      await fetchOrders(); // Refresh orders list
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.cancelOrder(orderId, reason);
      await fetchOrders(); // Refresh orders list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.confirmOrder(orderId);
      await fetchOrders(); // Refresh orders list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    cancelOrder,
    confirmOrder,
  };
};