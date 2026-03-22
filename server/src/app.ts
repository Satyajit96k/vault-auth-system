import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index';
import { logger } from './utils/logger';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middleware/rateLimiter';
import { ipWhitelist } from './middleware/ipWhitelist';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';

const app = express();

// 1. Trust proxy (for reverse proxy / load balancer)
app.set('trust proxy', 1);

// 2. Security headers
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// 3. CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
  maxAge: 86400,
}));

// 4. Cookie parser
app.use(cookieParser(config.cookieSecret));

// 5. Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// 6. Request logging (pino-http generates request IDs)
app.use(pinoHttp({
  logger,
  genReqId: () => crypto.randomUUID(),
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
}));

// 7. IP whitelist (before rate limiter — block banned IPs early)
app.use(ipWhitelist);

// 8. Global rate limiter
app.use(globalRateLimiter);

// 9. API routes
app.use('/api/auth', authRoutes);

// 10. Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

// 11. Health check (minimal — no timestamp in production)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 12. 404 + error handler (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
