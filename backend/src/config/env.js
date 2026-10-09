import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/why_am_i_stuck_db'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().optional(),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev_jwt_secret_key_12345'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  // Strict production check: Fail fast if JWT_SECRET is a placeholder or insecure
  if (parsedEnv.NODE_ENV === 'production') {
    if (
      !parsedEnv.JWT_SECRET ||
      parsedEnv.JWT_SECRET.includes('replace_with') ||
      parsedEnv.JWT_SECRET.length < 16
    ) {
      throw new Error(
        '[Security Error] In production, JWT_SECRET must be a cryptographically strong secret of at least 16 characters.'
      );
    }

    if (
      !process.env.MONGO_URI ||
      parsedEnv.MONGO_URI.includes('127.0.0.1') ||
      parsedEnv.MONGO_URI.includes('localhost')
    ) {
      console.warn(
        '\n[CONFIG WARNING] MONGO_URI is unset or pointing to localhost in production. Please set MONGO_URI in your Render environment variables to a cloud MongoDB instance (e.g. MongoDB Atlas).\n'
      );
    }
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingKeys = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    console.error(`\n[CRITICAL CONFIG ERROR] Invalid environment configuration: ${missingKeys}\n`);
  } else {
    console.error(`\n[CRITICAL CONFIG ERROR] ${error.message}\n`);
  }
  process.exit(1);
}

export const env = parsedEnv;
