# Vault — Frontend

Next.js 16 frontend for the OAuth 2.0 authentication system.

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **State**: Zustand (in-memory auth tokens)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios with token refresh interceptors
- **Icons**: Lucide React

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local

# 3. Start dev server (requires backend running on port 5000)
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Auth Flow

```
Login → POST /auth/login → access token (Zustand memory) + refresh token (HttpOnly cookie)
Page refresh → AuthGuard calls POST /auth/refresh → token rotation → new cookie + new access token
API call 401 → Axios interceptor → queue requests → refresh → retry all
Logout → POST /auth/logout → blacklist access token → revoke refresh → clear cookie → redirect /login
Logout all → POST /auth/logout-all → revoke ALL tokens → redirect /login
```

## Folder Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Register (split layout)
│   │   ├── layout.tsx       # Brand panel + form panel
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/         # Dashboard, Profile (sidebar layout)
│   │   ├── layout.tsx       # AuthGuard + Sidebar + TopBar
│   │   ├── dashboard/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx           # Root layout + Toaster
│   ├── page.tsx             # Landing page
│   └── globals.css          # Design tokens + animations
├── components/
│   ├── auth/                # AuthGuard, LoginForm, RegisterForm
│   ├── layout/              # Sidebar, TopBar, MobileNav, Footer
│   └── ui/                  # Alert, Avatar, Badge, Button, Card,
│                            # FormField, Input, PasswordStrength,
│                            # Skeleton, Toast, Toaster
├── hooks/
│   └── useAuth.ts           # login, register, logout, logoutAll
├── lib/
│   ├── api/
│   │   ├── client.ts        # Axios + token refresh queue interceptor
│   │   └── auth.ts          # API methods (register, login, refresh, getMe, logout, logoutAll)
│   ├── validations/
│   │   └── auth.ts          # Zod schemas (loginSchema, registerSchema)
│   └── utils.ts             # cn, formatDate, getInitials, getGreeting
├── stores/
│   ├── authStore.ts         # User + access token (memory only)
│   └── toastStore.ts        # Toast notifications
├── types/
│   └── index.ts             # User, AuthResponse, ApiError, etc.
└── middleware.ts             # Security headers
```

## Reusable Auth Components

| Component | Purpose |
|-----------|---------|
| `AuthGuard` | Wraps protected routes. Silent refresh on mount, skeleton while loading, redirect if unauthenticated |
| `LoginForm` | Email + password, Zod validation, rate limit countdown, toast errors |
| `RegisterForm` | Name + email + password + confirm, password strength meter, field-level errors |
| `useAuth` hook | `login()`, `register()`, `logout()`, `logoutAll()` — manages state + navigation |

## API Service Layer

| Method | Endpoint | Auth |
|--------|----------|------|
| `authApi.register()` | POST /auth/register | None |
| `authApi.login()` | POST /auth/login | None |
| `authApi.refresh()` | POST /auth/refresh | Cookie |
| `authApi.getMe()` | GET /auth/me | Bearer |
| `authApi.logout()` | POST /auth/logout | Bearer |
| `authApi.logoutAll()` | POST /auth/logout-all | Bearer |

## Security

- Access tokens stored in memory only (Zustand — not localStorage)
- Refresh tokens in HttpOnly cookies (not accessible to JavaScript)
- Token rotation on every refresh (old token revoked, new one issued)
- Reuse detection (stolen token triggers revocation of all sessions)
- CSRF mitigation via SameSite=Strict cookies
- Axios interceptor queues parallel 401s (prevents duplicate refresh calls)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
