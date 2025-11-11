// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// Redis store for rate limiting
const redisStore = {
  increment: async (key: string) => {
    try {
      const current = await redis.get(key);
      const count = current ? parseInt(current) + 1 : 1;
      await redis.set(key, count.toString(), 900); // 15 minutes TTL
      return count;
    } catch (error) {
      logger.error('Rate limit redis error:', error);
      return 1;
    }
  },
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore as any,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore as any,
});

export const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 verification requests per hour
  message: {
    success: false,
    message: 'Too many verification attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore as any,
});