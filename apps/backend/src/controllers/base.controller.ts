// src/controllers/base.controller.ts
import { Response } from 'express';
import { sendResponse, sendError } from '../utils/response';
import { PaginationMeta } from '../types/api';

export class BaseController {
  static handleSuccess(res: Response, data: any, message: string = 'Success') {
    sendResponse(res, 200, message, data);
  }

  static handleCreated(res: Response, data: any, message: string = 'Created successfully') {
    sendResponse(res, 201, message, data);
  }

  static handleSuccessWithPagination(
    res: Response, 
    data: any, 
    pagination: PaginationMeta, 
    message: string = 'Success'
  ) {
    sendResponse(res, 200, message, data, pagination);
  }

  static handleError(res: Response, error: any) {
    const statusCode = this.getStatusCode(error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    sendError(res, statusCode, message);
  }

  private static getStatusCode(error: any): number {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('already exists')) return 409;
    if (error.message.includes('invalid') || error.message.includes('validation')) return 400;
    if (error.message.includes('unauthorized') || error.message.includes('permission')) return 401;
    if (error.message.includes('forbidden')) return 403;
    return 500;
  }
}