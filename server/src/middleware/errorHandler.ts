import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/httpError';
import { logger } from '../utils/logger';
import { config } from '../config/index';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, path: req.path, method: req.method }, 'Error caught');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ status: 'error', message: 'A record with this value already exists' });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    return;
  }

  // Unknown errors — never leak internals in production
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(config.isDevelopment() && { detail: err.message, stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found` });
}
