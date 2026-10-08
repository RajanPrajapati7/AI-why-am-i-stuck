import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { env } from './config/env.js';
import { logger, httpLogger } from './config/logger.js';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// Security HTTP headers
app.use(helmet());

// Request logging middleware with correlation ID
app.use(httpLogger);

// Compute unique allowed origins from env and local development
const rawOrigins = [
  env.CLIENT_URL,
  ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const allowedOrigins = [...new Set(rawOrigins)];

// CORS with origin validation & credentials support (never wildcards)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile clients, curl, server-side tests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not permitted by CORS policy`));
      }
    },
    credentials: true,
  })
);

// Body parser and cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// General rate limiter
app.use('/api', apiLimiter);

// Health check endpoint (exempt from verbose auto-logging)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 'healthy' : 'degraded';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    service: 'AI Why Am I Stuck Assistant API',
    uptime: Math.round(process.uptime()),
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: env.NODE_ENV,
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(
    { port: PORT, environment: env.NODE_ENV },
    `AI Why Am I Stuck Assistant API listening on port ${PORT} [${env.NODE_ENV}]`
  );
});

// Process-level unhandled exception & rejection management
process.on('unhandledRejection', (err) => {
  logger.fatal({ err: err?.message || err }, `Unhandled Promise Rejection: ${err?.message || err}`);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err?.message || err }, `Uncaught Exception: ${err?.message || err}`);
  process.exit(1);
});

export { app, server };
