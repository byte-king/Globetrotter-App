# Globetrotter Challenge

A geography quiz game where players test their knowledge of world locations and landmarks.

## Features

- Interactive geography quiz with multiple difficulty levels
- User authentication and profile management
- Leaderboard to track high scores
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (for production) or SQLite (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/globetrotter-challenge.git
cd globetrotter-challenge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database connection string and JWT secret.

4. Set up the database:
```bash
# For development with SQLite
npm run migrate:dev

# For production with PostgreSQL
npm run migrate:deploy
```

5. Seed the database with initial data:
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel

3. Configure environment variables in Vercel:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT authentication

4. Deploy the application

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

## Database Migration

When switching from SQLite to PostgreSQL for production:

1. Update your `.env` file with the PostgreSQL connection string
2. Run the migration:
```bash
npm run migrate:deploy
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the database toolkit
- All contributors to this project
