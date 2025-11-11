// src/config/constants.ts
export const constants = {
  // Token expiration
  JWT_EXPIRY: '7d' as string | number,
  JWT_REFRESH_EXPIRY: '30d' as string | number,
  VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_TOKEN_EXPIRY: 1 * 60 * 60 * 1000, // 1 hour
  
  // Cache TTL
  CACHE_TTL: {
    PRODUCTS: 120, // 2 minutes
    CATEGORIES: 300, // 5 minutes
    STORES: 300, // 5 minutes
    SHIPPING: 1800, // 30 minutes
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File upload
  MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  
  // Roles
  ROLES: {
    USER: 'user',
    STORE_ADMIN: 'store_admin',
    SUPER_ADMIN: 'super_admin',
  } as const,
};

export type UserRole = typeof constants.ROLES[keyof typeof constants.ROLES];