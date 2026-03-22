import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { config } from '../config/index';
import { AppError } from '../utils/httpError';
import { sanitizeUser } from '../utils/helpers';
import { logger } from '../utils/logger';
import {
  signAccessToken,
  createAndStoreRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  blacklistAccessToken,
} from './token.service';

const USER_SELECT = { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true } as const;

// --- Register ---

export async function register(data: { name: string; email: string; password: string }) {
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw AppError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, config.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: { name: data.name, email, passwordHash },
    select: USER_SELECT,
  });

  logger.info({ userId: user.id }, 'User registered');
  return user;
}

// --- Login ---

export async function login(
  data: { email: string; password: string },
  ipAddress: string,
  userAgent: string | null
) {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) throw AppError.unauthorized('Invalid email or password');
  if (!user.isActive) throw AppError.forbidden('Account is deactivated');

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw AppError.unauthorized('Invalid email or password');

  // Issue tokens + update last login in parallel
  const [accessToken, refreshToken] = await Promise.all([
    Promise.resolve(signAccessToken({ sub: user.id, email: user.email, role: user.role })),
    createAndStoreRefreshToken(user.id, userAgent, ipAddress),
  ]);

  // Fire-and-forget: non-critical DB update
  prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
  }).catch(() => {});

  logger.info({ userId: user.id }, 'User logged in');
  return { user: sanitizeUser(user), accessToken, refreshToken };
}

// --- Refresh (token rotation + reuse detection) ---

export async function refresh(rawRefreshToken: string, ipAddress: string, userAgent: string | null) {
  const { hashedToken, userId, isRevoked } = await validateRefreshToken(rawRefreshToken);

  // Reuse detection: revoked token reused → likely stolen → nuke all sessions
  if (isRevoked) {
    logger.warn({ userId }, 'Refresh token reuse detected — revoking all sessions');
    await revokeAllUserTokens(userId);
    throw AppError.unauthorized('Suspicious activity detected. All sessions revoked.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    await revokeRefreshToken(hashedToken, userId);
    throw AppError.unauthorized('User not found or deactivated');
  }

  // Rotate: revoke old + issue new in parallel
  const [, accessToken, newRefreshToken] = await Promise.all([
    revokeRefreshToken(hashedToken, userId),
    Promise.resolve(signAccessToken({ sub: user.id, email: user.email, role: user.role })),
    createAndStoreRefreshToken(userId, userAgent, ipAddress),
  ]);

  return { accessToken, refreshToken: newRefreshToken };
}

// --- Get Current User ---

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!user) throw AppError.notFound('User not found');
  return user;
}

// --- Logout (Single Session) ---

export async function logout(
  userId: string,
  jti: string,
  exp: number,
  rawRefreshToken: string | undefined
) {
  await blacklistAccessToken(jti, exp);

  if (rawRefreshToken) {
    try {
      const { hashedToken } = await validateRefreshToken(rawRefreshToken);
      await revokeRefreshToken(hashedToken, userId);
    } catch {
      // Already invalid — continue
    }
  }

  logger.info({ userId }, 'User logged out');
}

// --- Logout All ---

export async function logoutAll(userId: string, jti: string, exp: number) {
  await Promise.all([
    blacklistAccessToken(jti, exp),
    revokeAllUserTokens(userId),
  ]);

  logger.info({ userId }, 'User logged out from all devices');
}
