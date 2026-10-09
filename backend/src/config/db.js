import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected. Mongoose will attempt to reconnect.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully.');
});

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    logger.info(
      { host: conn.connection.host, database: conn.connection.name },
      `MongoDB connected successfully: ${conn.connection.host} / ${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    logger.error(
      { err: error.message },
      `MongoDB connection failed: ${error.message}. Service will continue in degraded mode.`
    );
  }
};
