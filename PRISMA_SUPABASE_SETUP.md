# Prisma with Supabase on Vercel Setup

This document explains the changes made to ensure the Globetrotter Challenge application works correctly with Prisma and Supabase PostgreSQL when deployed to Vercel.

## Changes Made

### 1. Updated Prisma Schema

The Prisma schema was updated to use PostgreSQL as the database provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Optimized Prisma Client

The Prisma client initialization was optimized for serverless environments:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

### 3. Updated API Routes

All API routes were updated to use the singleton Prisma client instance from `lib/prisma.ts` instead of creating new instances. This prevents connection pool exhaustion in serverless environments.

Updated routes include:
- `app/api/scores/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/recover/route.ts`
- `app/api/random-cities/route.ts`
- `app/api/destination/route.ts`
- `app/api/generate-username/route.ts`
- `app/api/answer/route.ts`

### 4. Fixed UI Issues for Deployment

Several UI issues were fixed to ensure the application works correctly in production:

1. **Controlled Input Issue**: Fixed a React warning in the register page where a controlled input was changing to uncontrolled by ensuring the username input always has a defined value:
   ```typescript
   value={formData.username || ''}
   ```

2. **Generate Button Visibility**: Updated the CSS for the generate button in the register page to ensure it's visible in the deployed version:
   ```css
   .generateButton {
     padding: 0.75rem 1rem;
     border: none;
     border-radius: 8px;
     background-color: #4a90e2;
     color: white;
     cursor: pointer;
     transition: all 0.2s ease;
     white-space: nowrap;
     font-size: 0.9rem;
     font-weight: 500;
     min-width: 100px;
   }
   ```

3. **Form Container Styling**: Added missing CSS for the form container to ensure proper layout in production:
   ```css
   .formContainer {
     background: white;
     padding: 2rem;
     border-radius: 12px;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
     width: 100%;
     max-width: 400px;
   }
   ```

### 5. Added Deployment Scripts

The `package.json` was updated with scripts for Vercel deployment:

```json
"scripts": {
  "postinstall": "prisma generate",
  "vercel-build": "prisma generate && prisma migrate deploy && next build",
  "migrate:dev": "prisma migrate dev",
  "migrate:deploy": "prisma migrate deploy",
  "db:push": "prisma db push",
  "prisma:studio": "prisma studio"
}
```

### 6. Environment Configuration

The `.env` file was updated with the Supabase PostgreSQL connection string:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.fakxhnavfeujzfshhrfz.supabase.co:5432/postgres"
JWT_SECRET="your-secret-key-here"
```

## Deployment Process

1. Set up a Supabase PostgreSQL database
2. Configure environment variables in Vercel
3. Deploy the application to Vercel
4. Run database migrations

For detailed deployment instructions, see [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md).

## Benefits of This Setup

1. **Connection Pooling**: Prevents connection pool exhaustion in serverless environments
2. **Type Safety**: Maintains Prisma's type-safe database access
3. **Scalability**: Supabase PostgreSQL can scale with your application
4. **Reliability**: PostgreSQL is a robust, production-ready database
5. **Vercel Compatibility**: Works seamlessly with Vercel's serverless architecture

## Troubleshooting

If you encounter database connection issues:

1. Verify your `DATABASE_URL` is correctly set in Vercel
2. Make sure you've replaced `[YOUR-PASSWORD]` with your actual Supabase database password
3. Check that your Supabase project is active and not in a paused state
4. Ensure your database allows connections from Vercel's IP addresses

If you encounter UI issues:

1. Check browser console for React warnings or errors
2. Verify that all CSS modules are properly imported
3. Ensure all form inputs have proper value handling to prevent controlled/uncontrolled input warnings 