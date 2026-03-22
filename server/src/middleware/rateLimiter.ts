import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { redis } from '../config/redis';
import { config } from '../config/index';
import { getClientIp } from '../utils/helpers';

function createLimiter(keyPrefix: string, points: number, duration: number, blockDuration = 0) {
  return new RateLimiterRedis({ storeClient: redis, keyPrefix, points, duration, blockDuration });
}

// All limits configurable via ENV
const limiters = {
  register: createLimiter('rl:register', config.rateLimitRegisterPoints, config.rateLimitRegisterDuration),
  login: createLimiter('rl:login', config.rateLimitLoginPoints, config.rateLimitLoginDuration, config.rateLimitLoginBlock),
  refresh: createLimiter('rl:refresh', config.rateLimitRefreshPoints, config.rateLimitRefreshDuration),
  me: createLimiter('rl:me', config.rateLimitMePoints, config.rateLimitMeDuration),
  global: createLimiter('rl:global', config.rateLimitGlobalPoints, config.rateLimitGlobalDuration),
};

function middleware(
  limiter: RateLimiterRedis,
  maxPoints: number,
  keyFn: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await limiter.consume(keyFn(req));
      res.set('X-RateLimit-Limit', String(maxPoints));
      res.set('X-RateLimit-Remaining', String(Math.max(0, result.remainingPoints)));
      res.set('X-RateLimit-Reset', String(new Date(Date.now() + result.msBeforeNext).getTime()));
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        const retryAfter = Math.ceil(err.msBeforeNext / 1000);
        res.set('Retry-After', String(retryAfter));
        res.set('X-RateLimit-Limit', String(maxPoints));
        res.set('X-RateLimit-Remaining', '0');
        res.status(429).json({ status: 'error', message: 'Too many requests. Please try again later.', retryAfter });
        return;
      }
      // Redis down → fail closed (block request, don't let it through)
      res.status(503).json({ status: 'error', message: 'Service temporarily unavailable' });
    }
  };
}

const byIp = (req: Request) => getClientIp(req);
const byUser = (req: Request) => req.user?.id || getClientIp(req);

export const registerLimiter = middleware(limiters.register, config.rateLimitRegisterPoints, byIp);
export const loginLimiter = middleware(limiters.login, config.rateLimitLoginPoints, byIp);
export const refreshLimiter = middleware(limiters.refresh, config.rateLimitRefreshPoints, byIp);
export const meLimiter = middleware(limiters.me, config.rateLimitMePoints, byUser);
export const globalRateLimiter = middleware(limiters.global, config.rateLimitGlobalPoints, byIp);
