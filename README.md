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

The project is currently in the initial setup phase.

Completed:

- Project folder structure
- PostgreSQL database with Docker
- Prisma setup
- Initial database schema
- Environment configuration
- Backend dependencies installed

## Database Models

Current Prisma models:

- User
- Coin
- Wallet
- WalletAsset
- Transaction

Current enums:

- Role
- TransactionType
- TransactionStatus

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

### 2. Start PostgreSQL with Docker

```bash
docker compose up -d
```

### 3. Setup API environment

Create an `.env` file inside `apps/api`:

```env
DATABASE_URL="postgresql://ali:123456@localhost:5432/crypto_exchange?schema=public"
PORT=4000
JWT_SECRET="your-secret-key"
```

### 4. Install API dependencies

```bash
cd apps/api
npm install
```

### 5. Run Prisma migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Open Prisma Studio

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
