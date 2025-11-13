// src/utils/logger.ts
import winston from 'winston';
import { env } from '../config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.simple()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? logFormat : developmentFormat,
  defaultMeta: { service: 'grocify-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: logFormat
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: logFormat
    }),
  ],
});

// Morgan stream for HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};