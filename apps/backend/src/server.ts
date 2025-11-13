// src/server.ts
import express from 'express';
import { connectDatabase, disconnectDatabase } from './config/database.config';
import { ServerConfig } from './config/server.config'
import { EmailService } from './services/email.service'; // ✅ Import EmailService
import { setupCronJobs } from './utils/cron'; // ✅ Import setupCronJobs
// Import services yang diperlukan nanti

class Application {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setup();
  }

  private async setup() {
    this.setupConfig();
    await this.initializeServices();
  }

  private setupConfig() {
    // Panggil setupMiddleware langsung tanpa modification
    ServerConfig.setupMiddleware(this.app);
    ServerConfig.setupCloudinary();
  }

  private async initializeServices() {
    try {
      await connectDatabase();
      console.log('✅ Database connected successfully');

      // Initialize Cloudinary
      ServerConfig.setupCloudinary();
      console.log('✅ Cloudinary configured');

      // Initialize Email Service
      await EmailService.initializeTransporter();
      console.log('✅ Email service initialized');

      // Setup cron jobs
      setupCronJobs();
      console.log('✅ Cron jobs initialized');
      // Initialize other services nanti
      // await PaymentService.initializeMidtrans();
      // await EmailService.initializeTransporter();

    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      process.exit(1);
    }
  }

  private setupRoutes() {
    // Health check - tambahkan langsung di sini
    this.app.get('/api/health', (req: express.Request, res: express.Response) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
      });
    });
  }

  public start() {
    const port = ServerConfig.getPort();
    
    // Setup routes sebelum start
    this.setupRoutes();
    
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
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
