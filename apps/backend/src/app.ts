// src/app.ts
import express from 'express';
import { ServerConfig } from './config/server.config';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/profile';
import addressRoutes from './routes/addresses';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin-order.routes';

const app = express();

// Setup middleware dari ServerConfig
ServerConfig.setupMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

export default app;