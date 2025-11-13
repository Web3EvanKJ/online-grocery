// lib/types/api.ts
import { CartItem } from '../cart/cart';
import { OrderResponse } from '../order/order';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  error: string;
  message?: string;
}

// Specific response types for different endpoints
export interface CartResponse {
  data: CartItem[];
}

export interface OrdersResponse {
  data: OrderResponse[];
  pagination: PaginationMeta;
}