# Vault — Backend

OAuth 2.0 authentication API with JWT access tokens, refresh token rotation, and Redis-based security.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5.2.1
- **Language**: TypeScript 5 (strict mode)
- **Database**: PostgreSQL 16+ (Prisma ORM)
- **Cache**: Redis 7+ (ioredis)
- **Auth**: JWT + bcrypt + HttpOnly cookies
- **Docs**: Swagger / OpenAPI 3.0

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET (min 32 chars), COOKIE_SECRET (min 32 chars)

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate

# 5. Start dev server
npm run dev
```

## Environment Variables

See `.env.example` for all 28 configurable variables. Key ones:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `COOKIE_SECRET` | Yes | — | Cookie signing secret (min 32 chars) |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh token lifetime |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS allowed origin |
| `RATE_LIMIT_*` | No | Varies | Per-endpoint rate limits (all configurable) |
| `IP_WHITELIST_*` | No | Disabled | IP allowlist/blocklist with CIDR |

## API Endpoints

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/api/auth/register` | None | 3/10min | Create account |
| POST | `/api/auth/login` | None | 5/60s | Login, get tokens |
| POST | `/api/auth/refresh` | Cookie | 10/60s | Rotate refresh token |
| GET | `/api/auth/me` | Bearer | 30/60s | Get current user |
| POST | `/api/auth/logout` | Bearer | — | Logout current session |
| POST | `/api/auth/logout-all` | Bearer | — | Revoke all sessions |

Swagger docs: `http://localhost:5000/api/docs`

## Folder Structure

```
src/
├── app.ts                    # Express middleware chain
├── server.ts                 # Bootstrap + graceful shutdown
├── config/
│   ├── index.ts              # Environment config (28 vars)
│   ├── database.ts           # Prisma client
│   ├── redis.ts              # ioredis client
│   └── swagger.ts            # OpenAPI spec
├── controllers/
│   └── auth.controller.ts    # HTTP handlers (6 endpoints)
├── services/
│   ├── auth.service.ts       # Business logic
│   └── token.service.ts      # JWT + refresh tokens + Redis ops
├── routes/
│   └── auth.routes.ts        # Route definitions + Swagger JSDoc
├── middleware/
│   ├── authenticate.ts       # JWT verify + blacklist + revocation (1 Redis pipeline)
│   ├── rateLimiter.ts        # Redis-backed, all ENV-configurable, fails closed
│   ├── ipWhitelist.ts        # Allowlist/blocklist + CIDR + IPv6
│   ├── validate.ts           # Zod schema validation
│   └── errorHandler.ts       # Centralized: AppError, Prisma, Zod, JWT, unknown
├── schemas/
│   └── auth.schema.ts        # Register + login Zod schemas
├── types/
│   ├── index.ts              # IUser, IJwtPayload
│   └── express.d.ts          # Request augmentation
├── utils/
│   ├── helpers.ts            # hashToken, asyncHandler, parseDuration, getClientIp
│   ├── httpError.ts          # AppError class (400-500 factories)
│   └── logger.ts             # Pino with sensitive field redaction
└── prisma/
    └── schema.prisma         # User + RefreshToken models
```

## Security

- **Passwords**: bcrypt (12 rounds, salted)
- **Access tokens**: JWT with `jti` claim, 15min expiry, memory-only storage
- **Refresh tokens**: SHA-256 hashed, dual-stored (Redis + PostgreSQL), HttpOnly/Secure/SameSite=Strict cookie
- **Token rotation**: New refresh token on every use, old one revoked
- **Reuse detection**: Revoked token reused → all user sessions revoked
- **Mass revocation**: `allTokensRevokedAt` timestamp rejects old access tokens immediately
- **Rate limiting**: Redis-backed sliding window, 5 independent limiters, fails closed (503) on Redis down
- **IP filtering**: Allowlist/blocklist with CIDR notation, IPv4/IPv6
- **Headers**: Helmet (CSP, HSTS, X-Frame-Options, noSniff, XSS filter)
- **CORS**: Origin-restricted with credentials
- **Logging**: Pino with automatic redaction of passwords, tokens, cookies
- **Errors**: No sensitive data leaked in production responses

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |
