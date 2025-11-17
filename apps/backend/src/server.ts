// src/server.ts
import express from 'express';
import { ServerConfig } from './config/server.config';
import { connectDatabase, disconnectDatabase } from './config/database.config';
import { setupCronJobs } from './utils/cron';
import { PaymentService } from './services/payment.service';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { EmailService } from './services/email.service';
import type { ErrorRequestHandler } from 'express';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/profile';
import addressRoutes from './routes/addresses';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import shippingRoutes from './routes/shipping.routes';
import adminPaymentRoutes from './routes/admin-payment.routes';
import userAdminRouter from './routers/userAdmin.router';
import productAdminRouter from './routers/productAdmin.router';
import categoryAdminRouter from './routers/categoryAdmin.router';
import inventoryAdminRouter from './routers/inventoryAdmin.router';
import discountAdminRouter from './routers/discountAdmin.router';
import salesAdminRouter from './routers/salesAdmin.router';
import stockAdminRouter from './routers/stockAdmin.router';
import productSearchRouter from './routers/productSearch.router';
import storeLocationRouter from './routers/storeLocation.router';

class Application {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setup();
  }

  private async setup() {
    this.setupConfig();
    this.setupRoutes();
    this.setupErrorHandling();
    await this.initializeServices();
  }

  private setupConfig() {
    ServerConfig.setupMiddleware(this.app);
    ServerConfig.setupCloudinary();
  }

  private setupRoutes() {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/user', userRoutes);
    this.app.use('/api/addresses', addressRoutes);
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/payment', paymentRoutes);
    this.app.use('/api/shipping', shippingRoutes);
    this.app.use('/api/admin/payment', adminPaymentRoutes);
    this.app.use('/api/admin/users', userAdminRouter);
    this.app.use('/api/admin/products', productAdminRouter);
    this.app.use('/api/admin/categories', categoryAdminRouter);
    this.app.use('/api/admin/inventories', inventoryAdminRouter);
    this.app.use('/api/admin/discounts', discountAdminRouter);
    this.app.use('/api/admin/sales', salesAdminRouter);
    this.app.use('/api/admin/stocks', stockAdminRouter);
    this.app.use('/api/productSearch', productSearchRouter);
    this.app.use('/api/store-location/', storeLocationRouter);

    this.app.get('/health', this.healthCheck);
  }

  private setupErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler as ErrorRequestHandler);
  }

  private async initializeServices() {
    await connectDatabase();
    EmailService.initializeTransporter();
    // Test email configuration
    const emailTest = await EmailService.testEmail();
    if (emailTest) {
      console.log('✅ Email service initialized successfully');
    } else {
      console.log('❌ Email service initialization failed');
    }
    setupCronJobs();
  }

  private healthCheck = (req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  };

  public start() {
    const port = ServerConfig.getPort();

    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log('Cron jobs initialized');
    });
  }
}

// Start application
const application = new Application();
application.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

export default application;