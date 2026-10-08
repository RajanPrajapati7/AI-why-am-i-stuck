import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(
      { host: conn.connection.host, database: conn.connection.name },
      `MongoDB connected successfully: ${conn.connection.host} / ${conn.connection.name}`
    );
  } catch (error) {
    logger.fatal({ err: error.message }, `MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
