import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to forward rejected promises to the error handler
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// SHA-256 hash for refresh tokens before storage
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Cryptographically random refresh token
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Strip sensitive fields from user objects before returning to client
export function sanitizeUser(user: Record<string, unknown>) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Parse duration strings like "15m", "7d", "1h" into milliseconds
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

// Parse duration into seconds (for JWT expiry)
export function parseDurationSeconds(duration: string): number {
  return Math.floor(parseDuration(duration) / 1000);
}

// Get client IP from request, handling proxies
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}
