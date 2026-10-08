import pino from 'pino';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { env } from './env.js';

const isProduction = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

export const logger = pino({
  level: isTest ? 'silent' : env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'req.headers["x-api-key"]',
      'res.headers["set-cookie"]',
      'body.password',
      'body.passwordHash',
      'password',
      'passwordHash',
      'token',
      'jwt',
      'secret',
      'apiKey',
      '*.password',
      '*.passwordHash',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: isProduction ? { pid: process.pid } : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} -> ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} -> ${res.statusCode} (${err.message})`,
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.ip || req.socket?.remoteAddress,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
    err(err) {
      return {
        type: err.type,
        message: err.message,
        stack: isProduction ? undefined : err.stack,
      };
    },
  },
});
