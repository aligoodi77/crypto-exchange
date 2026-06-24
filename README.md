# CoinBarrier Exchange

CoinBarrier Exchange is a modern full-stack crypto exchange simulator built with Next.js, Node.js, PostgreSQL, Prisma, and TypeScript.

This project is designed as a portfolio-level fintech dashboard. It simulates the core features of a crypto exchange such as authentication, wallet management, market overview, trading flow, transaction history, and admin dashboard.

> This is a simulator project. It does not process real payments, deposits, withdrawals, or real financial transactions.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- bcrypt

### DevOps / Tools

- Docker
- Docker Compose
- Prisma Studio
- Git & GitHub

## Project Structure

```txt
coinbarrier-exchange/
  apps/
    web/
      src/
        app/
        components/
        features/
        lib/
        store/

    api/
      src/
      prisma/
        schema.prisma
      .env.example

  docker-compose.yml
  README.md
```

## Current Progress

The project has an active API and web app implementation.

Implemented backend areas include:

- Authentication with JWT, token revocation, email verification, and role checks
- Wallet, market, coin, trade, transaction, and admin API routes
- Prisma schema and migrations
- Coin market sync job
- Socket.IO realtime updates
- Zod validation and centralized error handling

## Database Models

Current Prisma models:

- User
- Coin
- Wallet
- WalletAsset
- Transaction
- RevokedToken
- VerificationToken
- TradeIdempotencyKey

Current enums:

- Role
- TransactionType
- TransactionStatus
- VerificationTokenType

## API Notes

Trade endpoints require an `Idempotency-Key` header:

```http
POST /api/trades/buy
Idempotency-Key: 6f4c4c1d-8dd8-4a54-9c1d-8dd55f48c481
```

Reusing the same key with the same request returns the stored result. Reusing it with a different request returns `409 Conflict`.

## Planned Features

- Landing page
- Login and register pages
- Protected dashboard
- Crypto markets page
- Trading simulation page
- Wallet management
- Transaction history
- Admin panel
- Role-based access control
- KYC demo flow
- Responsive mobile-first UI

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/aligoodi77/coinbarrier-exchange.git
cd coinbarrier-exchange
```

### 2. Configure Docker environment

Create a root `.env` from `.env.example` and set a local database password:

```bash
cp .env.example .env
```

If the old password was ever used outside local development, rotate it.

### 3. Start PostgreSQL with Docker

```bash
docker compose up -d
```

### 4. Setup API environment

Create an `.env` file inside `apps/api` from `apps/api/.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```

Set `DATABASE_URL` to match your root `.env` values, for example:

```env
DATABASE_URL="postgresql://crypto_exchange_user:replace-with-a-local-dev-password@localhost:5432/crypto_exchange?schema=public"
JWT_SECRET="replace-with-at-least-32-random-characters"
SYNC_SECRET="replace-with-at-least-16-random-characters"
```

### 5. Install API dependencies

```bash
cd apps/api
npm install
```

### 6. Run Prisma migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. Run API checks

```bash
npm run typecheck
```

### 8. Open Prisma Studio

```bash
npx prisma studio
```

## Project Goal

The goal of this project is to build a realistic, scalable, and professional full-stack fintech application that demonstrates:

- Modern frontend architecture
- Backend API design
- Database modeling
- Authentication flow
- Dashboard UI development
- Clean project structure
- Real-world development workflow

## Author

Ali Goudarzi

- GitHub: https://github.com/aligoodi77
- LinkedIn: https://www.linkedin.com/in/ali-goudarzi77/

# crypto-exchange

# crypto-exchange
