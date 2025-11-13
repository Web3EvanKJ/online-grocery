// src/config/redis.ts
import Redis, { type Redis as RedisType, type RedisOptions } from 'ioredis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

class RedisClient {
  private client: RedisType;
  private isConnected = false;

  constructor() {
    if (!env.REDIS_URL) {
      logger.warn('Redis URL not provided in env; Redis client will be created but not connected.');
    }

    const options: RedisOptions = {
      host: env.REDIS_URL,
      lazyConnect: true,
      // Use retryStrategy for reconnect timing
      retryStrategy: (retries: number) => Math.min(retries * 100, 2000),
    };

    this.client = new Redis(options);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('✅ Redis connected successfully');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('✅ Redis ready');
    });

    this.client.on('error', (error: unknown) => {
      this.isConnected = false;
      logger.error('❌ Redis connection error:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('🔌 Redis connection closed');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('🔌 Redis connection ended');
    });

    // Some ioredis versions may not emit 'reconnecting'; guard with optional chaining
    // @ts-ignore - best-effort listener for environments that emit it
    this.client.on?.('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.error('Redis connect error:', error);
        throw error;
      }
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      await this.ensureConnected();
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      await this.ensureConnected();
      if (typeof ttlSeconds === 'number' && ttlSeconds > 0) {
        // Use set + expire to avoid relying on deprecated helpers
        await this.client.set(key, value);
        await this.client.expire(key, ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.ensureConnected();
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      await this.ensureConnected();
      // For large datasets prefer SCAN; keys is acceptable for small/test datasets
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', error);
      return [];
    }
  }

  async flushPattern(pattern: string): Promise<void> {
    try {
      await this.ensureConnected();
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Redis flush pattern error:', error);
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      logger.error('Redis quit error:', error);
    }
  }

  getClient(): RedisType {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

export const redis = new RedisClient();
export default redis;