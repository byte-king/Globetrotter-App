# Vercel Deployment Guide

## Database Setup

This application uses PostgreSQL in production. Follow these steps to set up your database for Vercel deployment:

### 1. Create a PostgreSQL Database

You can use any PostgreSQL provider such as:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

### 2. Set Environment Variables in Vercel

After creating your database, you need to add the following environment variable to your Vercel project:

- `DATABASE_URL`: Your PostgreSQL connection string (provided by your database service)

To add environment variables in Vercel:
1. Go to your project in the Vercel dashboard
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add the `DATABASE_URL` variable with your PostgreSQL connection string

Example connection string format:
```
postgresql://username:password@host:port/database
```

### 3. Run Database Migrations

After deploying your project, you need to run the database migrations to set up your database schema.

You can do this by:

1. Adding a build command in your `package.json`:

```json
"scripts": {
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
}
```

2. Or by running the migration manually using the Vercel CLI:

```bash
vercel env pull
npx prisma migrate deploy
```

### 4. Seed the Database (Optional)

If you need to seed your database with initial data, you can add a seed script to your `package.json`:

```json
"scripts": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Then run:

```bash
npx prisma db seed
```

## Troubleshooting

If you encounter database connection issues:

1. Verify your `DATABASE_URL` is correctly set in Vercel
2. Check that your database provider allows connections from Vercel's IP addresses
3. Ensure your database is not in a paused/sleeping state
4. Check the Vercel logs for specific error messages

For more help, refer to the [Prisma documentation](https://www.prisma.io/docs/guides/deployment/deployment) on deployment. 