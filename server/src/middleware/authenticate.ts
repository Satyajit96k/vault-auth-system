import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { redis } from '../config/redis';
import { AppError } from '../utils/httpError';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token required');
    }

    const decoded = verifyAccessToken(authHeader.slice(7));

    // Single pipeline: check blacklist + mass revocation in one Redis round-trip
    const [[, blacklisted], [, revokedAt]] = await redis
      .pipeline()
      .exists(`blacklist:${decoded.jti}`)
      .get(`user:${decoded.sub}:allTokensRevokedAt`)
      .exec() as [[null, number], [null, string | null]];

    if (blacklisted) {
      throw AppError.unauthorized('Token revoked');
    }

    if (revokedAt && decoded.iat < parseInt(revokedAt, 10)) {
      throw AppError.unauthorized('All sessions revoked. Please log in again.');
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (err) {
    next(err);
  }
}
