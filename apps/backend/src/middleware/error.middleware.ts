// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.type === 'entity.parse.failed') {
    sendError(res, 400, 'Invalid JSON in request body');
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    sendError(res, 400, 'File too large. Maximum size is 1MB.');
    return;
  }

  sendError(res, 500, 'Internal server error');
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 404, `Route ${req.method} ${req.path} not found`);
};