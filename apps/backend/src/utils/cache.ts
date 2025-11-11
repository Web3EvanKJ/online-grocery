// src/utils/cache.ts
import { redis } from '../config/redis.js';
import { logger } from './logger.js';
import { constants } from '../config/constants.js';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      await redis.flushPattern(pattern);
    } catch (error) {
      logger.error(`Cache delete pattern error for pattern ${pattern}:`, error);
    }
  }

  async wrap<T>(
    key: string,
    fetchData: () => Promise<T>,
    ttl: number = constants.CACHE_TTL.PRODUCTS
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchData();
    await this.set(key, data, ttl);
    return data;
  }

  // Specific cache keys
  generateProductKey(storeId: number, location?: string): string {
    if (location) {
      return `products:store:${storeId}:location:${location}`;
    }
    return `products:store:${storeId}`;
  }

  generateCategoriesKey(): string {
    return 'categories:all';
  }

  generateStoresKey(): string {
    return 'stores:all';
  }

  generateUserKey(userId: number): string {
    return `user:${userId}`;
  }

  // Invalidate related caches
  async invalidateProductCaches(storeId?: number): Promise<void> {
    if (storeId) {
      await this.deletePattern(`products:store:${storeId}*`);
    } else {
      await this.deletePattern('products:store:*');
    }
    await this.deletePattern('categories:*');
  }

  async invalidateUserCaches(userId: number): Promise<void> {
    await this.delete(this.generateUserKey(userId));
    await this.deletePattern(`addresses:user:${userId}`);
  }
}

export const cacheService = new CacheService();