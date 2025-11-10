import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types/api';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  pagination?: PaginationMeta
): void => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    pagination
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any[]
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors })
  };
  res.status(statusCode).json(response);
};