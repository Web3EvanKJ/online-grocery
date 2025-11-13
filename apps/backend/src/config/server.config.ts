// src/config/server.config.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

config();

export class ServerConfig {
  static setupMiddleware(app: express.Application) {
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    const corsMiddleware = this.setupCors();
    const rateLimitMiddleware = this.setupRateLimit();
    app.use(corsMiddleware);
    // app.use(rateLimitMiddleware);
  }

  static setupCors() {
    return cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });
  }

  static setupRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    });
  }

  static setupCloudinary() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  static getPort(): number {
    return parseInt(process.env.PORT || '5000');
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}