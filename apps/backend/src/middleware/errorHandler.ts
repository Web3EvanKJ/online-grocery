// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import createHttpError from 'http-errors';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Array<{ field: string; message: string }> | undefined;

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const response: ErrorResponse = {
    success: false,
    message,
    errors,
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};