# Staff Guru - Nigeria Marketplace

This is a monorepo for the Staff Guru application, a reverse marketplace connecting skilled artisans with employers across Nigeria.

## Architecture

This Turborepo includes the following packages/apps:

- **`apps/web`**: Main Next.js application for Workers and Employers.
- **`apps/admin`**: Next.js application for Admin operations.
- **`packages/db`**: Database schema, Drizzle ORM setup, and seed scripts.
- **`packages/shared`**: Shared business logic, types, schemas, and constants.

## Prerequisites

- Node.js (>=18)
- `pnpm`
- PostgreSQL database

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the project with the following variables:
   ```env
   # PostgreSQL connection string
   DATABASE_URL="postgresql://user:password@localhost:5432/staffguru"

   # JWT Secret for authentication
   JWT_SECRET="your-super-secret-key-for-development"
   ```

3. **Database Setup**
   Run the following commands from the root to push the schema to your database and seed it:
   ```bash
   # Push schema to database
   pnpm --filter @repo/db run push

   # Seed the database (1 admin, 4 workers, 2 employers)
   pnpm --filter @repo/db run seed
   ```

4. **Run Development Servers**
   ```bash
   pnpm run dev
   ```
   - Web App will be running at `http://localhost:3000`
   - Admin App will be running at `http://localhost:3001` (configured in package.json)

## Core Business Rules
Implemented in `packages/shared`:
- **Agency Fee**: NGN 50,000 per worker.
- **Replacement Window**: 14 days from placement confirmation.
- **Removal Notice**: 3 days notice required by employer.
- **Access Rule**: Worker contact details are only returned if a Selection with a verified Payment exists.
- **Refunds**: No refunds allowed.

## Authentication & Roles
- **Roles**: `WORKER`, `EMPLOYER`, `ADMIN` (One role per account).
- **Enforcement**: Role access is strictly guarded in `middleware.ts` for all routes and verified inside route handlers/server actions using the decrypted JWT session.
