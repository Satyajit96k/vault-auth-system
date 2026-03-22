import { PrismaClient } from '@prisma/client';
import { config } from './index';

export const prisma = new PrismaClient({
  log: config.isDevelopment() ? ['query', 'info', 'warn', 'error'] : ['error'],
});
