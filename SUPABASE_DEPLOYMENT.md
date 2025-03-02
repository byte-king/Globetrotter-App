# Deploying Globetrotter Challenge with Supabase and Vercel

This guide will help you deploy the Globetrotter Challenge application to Vercel using Supabase as the PostgreSQL database provider.

## Prerequisites

- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account
- Your project code pushed to a GitHub repository

## Step 1: Set Up Supabase Database

1. Log in to your Supabase account and create a new project
2. Note your database connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fakxhnavfeujzfshhrfz.supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with your actual database password

## Step 2: Deploy to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: Leave as default (it will use the `vercel-build` script from package.json)
   - Output Directory: Leave as default
   - Install Command: Leave as default

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following variables:
     - `DATABASE_URL`: Your Supabase PostgreSQL URL (from Step 1)
     - `JWT_SECRET`: A strong random string for JWT authentication

6. Click "Deploy"

## Step 3: Run Database Migrations

After the initial deployment, you need to set up your database schema. The `vercel-build` script in your package.json will automatically run the Prisma migrations during deployment.

If you need to manually run migrations:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your local project to the Vercel project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull
   ```

4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Step 4: Seed the Database (Optional)

If you want to populate your database with initial data:

1. Make sure you've pulled the environment variables as described above
2. Run the seed script:
   ```bash
   npx prisma db seed
   ```

## Troubleshooting

### Connection Issues

If you encounter database connection issues:

1. Verify your `DATABASE_URL` is correctly set in Vercel
2. Make sure you've replaced `[YOUR-PASSWORD]` with your actual Supabase database password
3. Check that your Supabase project is active and not in a paused state
4. Ensure your database allows connections from Vercel's IP addresses

### Migration Issues

If migrations fail:

1. Check Vercel build logs for specific error messages
2. Try running migrations locally with the Supabase connection string to debug
3. Make sure your Prisma schema is compatible with PostgreSQL

### Performance Optimization

For better performance:

1. Consider enabling connection pooling in Supabase
2. Use the Prisma connection pooling configuration for serverless environments
3. Implement caching for frequently accessed data

## Next Steps

After successful deployment:

1. Set up monitoring for your application
2. Configure automatic backups for your Supabase database
3. Consider setting up a staging environment for testing changes before production 