# 🌍 Globetrotter Challenge

A geography-based guessing game that tests your knowledge of world cities and landmarks.

![Globetrotter Challenge](https://via.placeholder.com/800x400?text=Globetrotter+Challenge)

## 🚀 Features

### 🎮 Gameplay
- **City Guessing**: Test your geography knowledge by guessing cities from visual clues
- **Score Tracking**: Earn points based on the accuracy and speed of your guesses
- **Global Leaderboard**: Compete with players worldwide and see your ranking
- **Progressive Difficulty**: Challenges become more difficult as you advance

### 👤 User Management
- **Custom Usernames**: Create a unique identity or generate a random username
- **Secure Authentication**: JWT-based authentication system
- **Account Recovery**: Reset your password using your registered email
- **User Profiles**: View your stats and game history

### 🧩 Technical Features
- **Next.js 15 with App Router**: Modern React framework with server components
- **Turbopack**: Faster development experience with Next.js Turbopack
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Supabase Integration**: Scalable PostgreSQL database hosting
- **Serverless Architecture**: Optimized for Vercel deployment
- **Responsive Design**: Play on any device - mobile, tablet, or desktop

## 📋 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or Supabase)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/globetrotter-challenge.git
cd globetrotter-challenge
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create a .env file with the following variables
DATABASE_URL="postgresql://postgres:password@localhost:5432/globetrotter"
JWT_SECRET="your-secret-key-here"
```

4. Set up the database
```bash
npm run migrate:dev
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Deployment

The application is configured for deployment on Vercel with Supabase as the database provider.

1. Create a Supabase account and project
2. Set up environment variables in Vercel
3. Connect your GitHub repository to Vercel
4. Deploy!

For detailed deployment instructions, see [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md).

## 🏗️ Architecture

### Frontend
- **Next.js App Router**: Server and client components
- **React 19**: Latest React features
- **CSS Modules**: Scoped styling for components

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Database access layer
- **JWT Authentication**: Secure user sessions
- **PostgreSQL**: Relational database for data storage

### Database Schema
- **Users**: Player accounts and authentication
- **Scores**: Game results and leaderboard data
- **Cities**: Geographic data for challenges
- **Challenges**: Game session information

## 🧪 Game Mechanics

1. **Challenge Generation**:
   - Random selection of cities from the database
   - Difficulty adjustment based on player skill

2. **Scoring System**:
   - Points awarded based on:
     - Distance from correct location
     - Time taken to answer
     - Difficulty of the challenge

3. **Leaderboard**:
   - Global ranking system
   - Weekly and all-time high scores

## 🛠️ Development

### Available Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run migrate:dev`: Create and apply database migrations
- `npm run db:push`: Push schema changes without migrations
- `npm run prisma:studio`: Open Prisma Studio to manage database

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Unique Names Generator](https://www.npmjs.com/package/unique-names-generator)
