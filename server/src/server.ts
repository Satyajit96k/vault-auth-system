import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config/index';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';

async function startServer() {
  try {
    if (config.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters (256 bits)');
    }
    if (config.cookieSecret.length < 32) {
      throw new Error('COOKIE_SECRET must be at least 32 characters');
    }

    await prisma.$connect();
    logger.info('PostgreSQL connected');

    await redis.ping();
    logger.info('Redis connected');

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down`);
      server.close(async () => {
        await prisma.$disconnect();
        redis.disconnect();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled rejection'));
    process.on('uncaughtException', (err) => { logger.fatal({ err }, 'Uncaught exception'); process.exit(1); });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
