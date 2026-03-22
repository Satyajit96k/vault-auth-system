import pino from 'pino';
import { config } from '../config/index';

export const logger = pino({
  level: config.logLevel,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'passwordHash', 'token', 'accessToken', 'refreshToken'],
    censor: '[REDACTED]',
  },
  ...(config.isProduction()
    ? {
        formatters: { level: (label: string) => ({ level: label }) },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }),
});
