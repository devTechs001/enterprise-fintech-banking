import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { testConnection } from './database/connection.js';

// Import middleware
import { errorHandler } from './middleware/error/errorHandler.js';
import { requestLogger } from './middleware/logging/requestLogger.js';

// Import routes
import authRoutes from './api/v1/auth/auth.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Enterprise Fintech Banking API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      accounts: '/api/v1/accounts',
      transactions: '/api/v1/transactions',
      cards: '/api/v1/cards',
      loans: '/api/v1/loans',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(config.server.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏦 Enterprise Fintech Banking Server                 ║
║                                                        ║
║   Server running on port ${config.server.port}                    ║
║   Environment: ${config.env}                                    ║
║   Health check: http://localhost:${config.server.port}/health          ║
║   API: http://localhost:${config.server.port}/api                      ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
