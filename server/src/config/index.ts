import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function optionalInt(key: string, defaultValue: number): number {
  const v = process.env[key];
  return v ? parseInt(v, 10) : defaultValue;
}

export const config = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: optionalInt('PORT', 5000),
  apiVersion: optionalEnv('API_VERSION', 'v1'),

  // Database
  databaseUrl: requireEnv('DATABASE_URL'),

  // Redis
  redisUrl: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  redisPassword: process.env.REDIS_PASSWORD || undefined,

  // JWT
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtAccessExpiry: optionalEnv('JWT_ACCESS_EXPIRY', '15m'),
  jwtRefreshExpiry: optionalEnv('JWT_REFRESH_EXPIRY', '7d'),
  jwtIssuer: optionalEnv('JWT_ISSUER', 'auth-server'),
  jwtAudience: optionalEnv('JWT_AUDIENCE', 'auth-client'),

  // Cookies
  cookieSecret: requireEnv('COOKIE_SECRET'),
  cookieDomain: optionalEnv('COOKIE_DOMAIN', 'localhost'),
  cookieSecure: optionalEnv('COOKIE_SECURE', 'false') === 'true',

  // CORS
  frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),

  // Rate Limiting (all configurable via ENV)
  rateLimitRegisterPoints: optionalInt('RATE_LIMIT_REGISTER_POINTS', 3),
  rateLimitRegisterDuration: optionalInt('RATE_LIMIT_REGISTER_DURATION', 600),
  rateLimitLoginPoints: optionalInt('RATE_LIMIT_LOGIN_POINTS', 5),
  rateLimitLoginDuration: optionalInt('RATE_LIMIT_LOGIN_DURATION', 60),
  rateLimitLoginBlock: optionalInt('RATE_LIMIT_LOGIN_BLOCK', 300),
  rateLimitRefreshPoints: optionalInt('RATE_LIMIT_REFRESH_POINTS', 10),
  rateLimitRefreshDuration: optionalInt('RATE_LIMIT_REFRESH_DURATION', 60),
  rateLimitMePoints: optionalInt('RATE_LIMIT_ME_POINTS', 30),
  rateLimitMeDuration: optionalInt('RATE_LIMIT_ME_DURATION', 60),
  rateLimitGlobalPoints: optionalInt('RATE_LIMIT_GLOBAL_POINTS', 100),
  rateLimitGlobalDuration: optionalInt('RATE_LIMIT_GLOBAL_DURATION', 60),

  // IP Whitelisting
  ipWhitelistEnabled: optionalEnv('IP_WHITELIST_ENABLED', 'false') === 'true',
  ipWhitelistMode: optionalEnv('IP_WHITELIST_MODE', 'allowlist') as 'allowlist' | 'blocklist',
  ipWhitelistIps: optionalEnv('IP_WHITELIST_IPS', '127.0.0.1,::1').split(',').map(ip => ip.trim()),

  // Logging
  logLevel: optionalEnv('LOG_LEVEL', 'debug'),

  // Bcrypt
  bcryptSaltRounds: optionalInt('BCRYPT_SALT_ROUNDS', 12),

  isDevelopment() { return this.nodeEnv === 'development'; },
  isProduction() { return this.nodeEnv === 'production'; },
} as const;
