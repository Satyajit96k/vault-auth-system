import Redis, { RedisOptions } from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

const options: RedisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 10000),
  ...(config.redisPassword && { password: config.redisPassword }),
};

export const redis = new Redis(config.redisUrl, options);

redis.on('error', (err) => logger.error({ err }, 'Redis connection error'));
