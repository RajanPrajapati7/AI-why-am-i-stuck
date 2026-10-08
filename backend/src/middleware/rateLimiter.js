import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 10000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: env.NODE_ENV === 'test' ? 10000 : 30, // 30 AI requests per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a few moments before triggering another diagnosis.',
  },
});
