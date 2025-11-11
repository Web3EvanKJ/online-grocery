// src/types/index.ts
import { Request } from 'express';
import { UserRole } from '../config/constants.js';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
  is_verified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}