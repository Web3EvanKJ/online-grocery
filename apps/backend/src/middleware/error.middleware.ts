// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { HttpError } from '../utils/httpError'; // 👈 add this

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Handle malformed JSON
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON in request body');
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 400, 'File too large. Maximum size is 1MB.');
  }

  const isCustom =
    err instanceof HttpError ||
    (typeof err?.status === 'number' && err.status >= 400 && err.status < 600);

  const status = isCustom ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  const errorName = err.name || 'UnknownError';

  if (status >= 500) {
    console.error('GLOBAL_SERVER_ERROR:', err.stack || err);
  } else {
    console.warn(`HTTP_ERROR [${status}]: ${message}`);
  }

  return res.status(status).json({
    msg: message,
    error: errorName,
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 404, `Route ${req.method} ${req.path} not found`);
};