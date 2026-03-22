import jwt, { TokenExpiredError, JsonWebTokenError, NotBeforeError, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { config } from '../config/index';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { hashToken, generateRefreshToken, parseDuration, parseDurationSeconds } from '../utils/helpers';
import { AppError } from '../utils/httpError';
import { logger } from '../utils/logger';
import { IJwtPayload } from '../types/index';

// Pre-computed constants — no per-request parsing
const REFRESH_EXPIRY_MS = parseDuration(config.jwtRefreshExpiry);
const REFRESH_EXPIRY_S = Math.floor(REFRESH_EXPIRY_MS / 1000);
const ACCESS_EXPIRY_S = parseDurationSeconds(config.jwtAccessExpiry);

// --- Access Tokens ---

export function signAccessToken(payload: { sub: string; email: string; role: Role }): string {
  const jti = crypto.randomUUID();

  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role, type: 'access', jti },
    config.jwtSecret,
    { expiresIn: ACCESS_EXPIRY_S, issuer: config.jwtIssuer, audience: config.jwtAudience } as SignOptions
  );
}

export function verifyAccessToken(token: string): IJwtPayload {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    }) as IJwtPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) throw AppError.unauthorized('Access token expired');
    if (err instanceof NotBeforeError) throw AppError.unauthorized('Access token not yet valid');
    if (err instanceof JsonWebTokenError) throw AppError.unauthorized('Invalid access token');
    throw err;
  }
}

// --- Access Token Blacklist ---

export async function blacklistAccessToken(jti: string, exp: number): Promise<void> {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`blacklist:${jti}`, ttl, '1');
  }
}

// --- Refresh Tokens ---

export async function createAndStoreRefreshToken(
  userId: string,
  deviceInfo: string | null,
  ipAddress: string | null
): Promise<string> {
  const rawToken = generateRefreshToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_MS);

  // DB write + Redis writes in parallel
  await Promise.all([
    prisma.refreshToken.create({
      data: { token: hashedToken, userId, deviceInfo, ipAddress, expiresAt },
    }),
    redis.pipeline()
      .setex(`refresh:${hashedToken}`, REFRESH_EXPIRY_S, userId)
      .sadd(`user:${userId}:refreshTokens`, hashedToken)
      .exec(),
  ]);

  return rawToken;
}

export async function validateRefreshToken(rawToken: string): Promise<{
  hashedToken: string;
  userId: string;
  isRevoked: boolean;
}> {
  const hashedToken = hashToken(rawToken);

  // Fast path: Redis
  const redisUserId = await redis.get(`refresh:${hashedToken}`);
  if (redisUserId) {
    return { hashedToken, userId: redisUserId, isRevoked: false };
  }

  // Fallback: DB (token may have been evicted from Redis cache)
  const dbToken = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    select: { userId: true, expiresAt: true, isRevoked: true },
  });

  if (!dbToken) throw AppError.unauthorized('Invalid refresh token');
  if (dbToken.expiresAt < new Date()) throw AppError.unauthorized('Refresh token expired');

  return { hashedToken, userId: dbToken.userId, isRevoked: dbToken.isRevoked };
}

export async function revokeRefreshToken(hashedToken: string, userId: string): Promise<void> {
  await Promise.all([
    prisma.refreshToken.update({
      where: { token: hashedToken },
      data: { isRevoked: true },
    }),
    redis.pipeline()
      .del(`refresh:${hashedToken}`)
      .srem(`user:${userId}:refreshTokens`, hashedToken)
      .exec(),
  ]);
}

// --- Bulk Revocation ---

export async function revokeAllUserTokens(userId: string): Promise<void> {
  const tokenHashes = await redis.smembers(`user:${userId}:refreshTokens`);

  // Pipeline all Redis deletes + set revocation timestamp in one round-trip
  const pipe = redis.pipeline();
  for (const hash of tokenHashes) {
    pipe.del(`refresh:${hash}`);
  }
  pipe.del(`user:${userId}:refreshTokens`);
  pipe.setex(`user:${userId}:allTokensRevokedAt`, ACCESS_EXPIRY_S, Math.floor(Date.now() / 1000).toString());

  await Promise.all([
    pipe.exec(),
    prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    }),
  ]);

  logger.info({ userId }, 'All user tokens revoked');
}
