# Database Seeding Guide for Globetrotter Challenge

This guide explains how to seed your Supabase PostgreSQL database with initial data for the Globetrotter Challenge application.

## Understanding the Seed Process

The Globetrotter Challenge application requires initial data to function properly. The seeding process populates your database with:

1. **Destinations**: Cities with their associated clues, fun facts, and trivia
2. (Optional) Sample users and scores for testing

## Prerequisites

- Supabase project set up
- Database connection string configured in your environment
- Access to the `dataset.json` file (included in the repository)

## Seeding Methods

### Method 1: Automatic Seeding During Development

During local development, you can run:

```bash
npx prisma db seed
```

This command is configured in your `package.json` to execute the `prisma/seed.ts` script, which reads from `dataset.json` and populates the database.

### Method 2: Manual Seeding in Production

For production environments like Vercel with Supabase:

1. **Connect to your Supabase database**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor

2. **Run the seed script**:
   - You can either:
     - Upload and execute the `prisma/seed.ts` file (converted to SQL)
     - Or use the Prisma CLI with your production database URL

```bash
# Using Prisma CLI with production database
DATABASE_URL="your-supabase-connection-string" npx prisma db seed
```

### Method 3: Seeding During Vercel Deployment

To seed your database during Vercel deployment:

1. **Add the seed command to your build script**:

```json
"scripts": {
  "vercel-build": "prisma generate && prisma migrate deploy && prisma db seed && next build"
}
```

2. **Ensure your dataset.json file is included in your repository**

3. **Set the DATABASE_URL environment variable in Vercel**

## Verifying the Seed

After seeding, you can verify that your data was properly loaded:

1. **Using Prisma Studio**:
```bash
npx prisma studio
```

2. **Using Supabase Dashboard**:
   - Go to your Supabase project
   - Navigate to Table Editor
   - Check the "Destination" table for entries

## Troubleshooting

### Common Issues

1. **Connection errors**:
   - Verify your DATABASE_URL is correct
   - Ensure your IP is allowed in Supabase's connection pooling settings

2. **Permission issues**:
   - Check that your database user has sufficient privileges

3. **Duplicate entries**:
   - If you need to re-seed, first clear the existing data:
   ```sql
   TRUNCATE TABLE "Destination" RESTART IDENTITY CASCADE;
   ```

4. **Dataset not found**:
   - Ensure `dataset.json` is in the root directory of your project
   - Check file permissions

## Dataset Structure

The `dataset.json` file contains an array of destination objects with the following structure:

```json
{
  "city": "City Name",
  "country": "Country Name",
  "clues": ["Clue 1", "Clue 2", "Clue 3"],
  "fun_fact": ["Fun Fact 1", "Fun Fact 2"],
  "trivia": ["Trivia 1", "Trivia 2"],
  "difficulty": "Easy|Medium|Hard"
}
```

## Custom Seeding

If you want to customize the seed data:

1. Modify the `dataset.json` file with your own destinations
2. Adjust the `prisma/seed.ts` script if you're changing the data structure
3. Run the seeding process again

## Important Notes

- The seeding process may take several minutes depending on the size of your dataset
- Avoid running the seed process multiple times without clearing the database first to prevent duplicate entries
- For large datasets, consider breaking up the seeding process into smaller batches 