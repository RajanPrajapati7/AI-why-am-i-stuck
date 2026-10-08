import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = env.NODE_ENV === 'production';

  // Server-side structured error log
  logger.error(
    {
      err: {
        message: err.message,
        name: err.name,
        stack: isProduction ? undefined : err.stack,
      },
      reqId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    },
    `Request error on ${req.method} ${req.originalUrl}: ${err.message}`
  );

  // Client-safe response format
  let clientMessage = err.message;
  if (statusCode === 500 && isProduction) {
    clientMessage = 'An unexpected internal error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage || 'Internal Server Error',
    stack: isProduction ? undefined : err.stack,
  });
};
