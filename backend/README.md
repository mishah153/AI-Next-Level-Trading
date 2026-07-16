# AINextLevelTrading — Backend API

NestJS + Prisma + PostgreSQL API for the AI-driven multi-market trading platform.

## Architecture

Clean, feature-first, modular architecture:

```
src/
├── auth/          JWT access + refresh (rotation), register/login/logout
├── users/         Profile, risk profile, MFA, subscription tier
├── markets/       Instruments (crypto/stocks/forex)
├── signals/       AI signals with confidence + rationale layers
├── whales/        Whale-Eye large-transaction feed + stats
├── connections/   Exchange API keys (AES-256-GCM encrypted at rest)
├── automation/    Strategies (risk level, spending limit, auto-execute)
├── orders/        Order placement + history
├── portfolio/     Positions + computed portfolio summary
├── health/        Liveness + DB readiness probe (Terminus)
├── common/        Guards (JWT, Roles), filters, interceptors, crypto, decorators
├── config/        Env validation (class-validator)
└── prisma/        PrismaService (+ schema and migrations under /prisma)
```

**Cross-cutting:** global `JwtAuthGuard` (opt out with `@Public()`), `RolesGuard`
(`@Roles(Role.ADMIN)`), `ThrottlerGuard` (rate limiting), global `ValidationPipe`
(whitelist + transform), `AllExceptionsFilter`, request `LoggingInterceptor`,
Helmet, CORS, URI versioning (`/api/v1/...`), Swagger at `/api/docs`.

## Prerequisites

- Node 22+
- PostgreSQL 16 (local, or `docker compose up db` from the repo root)

## Setup

```bash
cp .env.example .env          # adjust secrets for your environment
npm install
npm run prisma:generate
npm run prisma:migrate         # applies prisma/migrations to your DB
npm run db:seed                # loads demo user + instruments/signals/whales
npm run start:dev              # http://localhost:4000/api
```

Swagger UI: **http://localhost:4000/api/docs**

Demo credentials (after seeding): `alex@ainextleveltrading.com` / `Sup3rSecret!`

## Quality gates

```bash
npm run build      # tsc/nest build — passing
npm run lint       # eslint — 0 errors
npm test           # jest unit tests — passing
npm run test:e2e   # e2e (boots the app; validation + 404 checks)
```

## Docker

From the repo root: `docker compose up --build` brings up Postgres, Redis and the
API (migrations run automatically on boot).

## Security notes

- Passwords hashed with bcrypt (cost 12).
- Refresh tokens stored only as SHA-256 hashes; rotated on every refresh.
- Exchange API keys/secrets encrypted with AES-256-GCM (`ENCRYPTION_KEY`), never
  returned to clients (only a masked preview).
- Non-custodial by design: the platform executes on connected exchange accounts.
