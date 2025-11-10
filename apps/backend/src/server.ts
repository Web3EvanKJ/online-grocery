// src/server.ts
import express from 'express';
import { ServerConfig } from './config/server.config';
import { connectDatabase, disconnectDatabase } from './config/database.config';
import { setupCronJobs } from './utils/cron';
import { PaymentService } from './services/payment.service';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { EmailService } from './services/email.service';

// Routes
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';

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
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/payments', paymentRoutes);
    
    this.app.get('/health', this.healthCheck);
  }

  private setupErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  private async initializeServices() {
    await connectDatabase();
    PaymentService.initializeMidtrans();
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
      environment: process.env.NODE_ENV 
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