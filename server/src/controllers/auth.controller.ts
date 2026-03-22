import { Request, Response } from 'express';
import { config } from '../config/index';
import { asyncHandler, getClientIp, parseDurationSeconds } from '../utils/helpers';
import * as authService from '../services/auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';

// Pre-computed — no per-request parsing
const ACCESS_EXPIRY_S = parseDurationSeconds(config.jwtAccessExpiry);
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: parseDurationSeconds(config.jwtRefreshExpiry) * 1000,
  domain: config.cookieDomain === 'localhost' ? undefined : config.cookieDomain,
};
const CLEAR_COOKIE_OPTIONS = { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json({ status: 'success', message: 'User registered successfully', data: { user } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, getClientIp(req), req.headers['user-agent'] || null);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: { user: result.user, accessToken: result.accessToken, tokenType: 'Bearer', expiresIn: ACCESS_EXPIRY_S },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawRefreshToken) {
    res.status(401).json({ status: 'error', message: 'Refresh token required' });
    return;
  }

  const result = await authService.refresh(rawRefreshToken, getClientIp(req), req.headers['user-agent'] || null);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({
    status: 'success',
    data: { accessToken: result.accessToken, tokenType: 'Bearer', expiresIn: ACCESS_EXPIRY_S },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUser(req.user!.id);
  res.status(200).json({ status: 'success', data: { user } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.id, req.user!.jti, req.user!.exp, req.cookies?.[REFRESH_COOKIE_NAME]);
  res.cookie(REFRESH_COOKIE_NAME, '', CLEAR_COOKIE_OPTIONS);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id, req.user!.jti, req.user!.exp);
  res.cookie(REFRESH_COOKIE_NAME, '', CLEAR_COOKIE_OPTIONS);
  res.status(200).json({ status: 'success', message: 'Logged out from all devices' });
});
