// src/config/env.ts - Minimal version
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-min-32-chars-long',
  
  // Email
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  
  // Application
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PORT: process.env.PORT || '5000',
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  
  // External APIs
  RAJAONGKIR_API_KEY: process.env.RAJAONGKIR_API_KEY,
  
  // Upload
  UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE || '1048576',
};

export type EnvConfig = typeof env;