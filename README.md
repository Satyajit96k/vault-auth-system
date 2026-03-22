# Vault — OAuth 2.0 Authentication System

Full-stack authentication system with Next.js 16 frontend and Express 5 backend.

## Quick Start

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # Edit: set DATABASE_URL, JWT_SECRET, COOKIE_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run dev                  # Runs on :5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.local.example .env.local
npm run dev                  # Runs on :3000
```

Requires: Node.js 20+, PostgreSQL 16+, Redis 7+

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand |
| Backend | Express 5, TypeScript, Prisma, ioredis |
| Database | PostgreSQL |
| Cache | Redis (rate limiting, token blacklist, refresh token cache) |
| Auth | JWT access tokens + HttpOnly cookie refresh tokens |

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login (returns JWT + sets cookie) |
| POST | /api/auth/refresh | Rotate refresh token |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/logout | Logout current session |
| POST | /api/auth/logout-all | Revoke all sessions |

Swagger docs: http://localhost:5000/api/docs

## Security

- Access tokens in memory (never localStorage), refresh tokens in HttpOnly cookies
- Token rotation on every refresh, reuse detection revokes all sessions
- Redis-backed rate limiting (fails closed), IP allowlist/blocklist with CIDR
- Helmet, CORS, bcrypt (12 rounds), Pino logging with field redaction
