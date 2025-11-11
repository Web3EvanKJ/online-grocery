// src/utils/api.ts
import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export class ApiResponseUtil {
  static success(res: Response, message: string, data?: any) {
    const response: ApiResponse = {
      success: true,
      message,
      data,
    };
    return res.json(response);
  }

  static created(res: Response, message: string, data?: any) {
    const response: ApiResponse = {
      success: true,
      message,
      data,
    };
    return res.status(201).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, errors?: any) {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: Array<{ field: string; message: string }>) {
    return this.error(res, 'Validation failed', 400, errors);
  }

  static notFound(res: Response, resource: string = 'Resource') {
    return this.error(res, `${resource} not found`, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static conflict(res: Response, message: string = 'Resource already exists') {
    return this.error(res, message, 409);
  }
}