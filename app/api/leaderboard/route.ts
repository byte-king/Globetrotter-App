// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface LeaderboardRow {
  id: number;
  username: string;
  score: number;
  streak: number | null;
  difficulty: string | null;
  createdAt: Date | null;
}

export async function GET() {
  try {
    // Define the raw SQL query as a plain string
    const query = `
      SELECT 
        u.id,
        u.username,
        u."highestScore" AS score,
        s.streak,
        s.difficulty,
        s."createdAt"
      FROM "User" u
      LEFT JOIN (
        SELECT DISTINCT ON ("userId") *
        FROM "Score"
        ORDER BY "userId", "createdAt" DESC
      ) s ON s."userId" = u.id
      ORDER BY u."highestScore" DESC
      LIMIT 100;
    `;

    // Use $queryRawUnsafe to execute the query without prepared statement caching
    const leaderboardData = await prisma.$queryRawUnsafe<LeaderboardRow[]>(query);

    // Optionally, add rank based on the result order
    const rankedData = leaderboardData.map((row, index) => ({
      ...row,
      rank: index + 1,
      username: row.username || 'Anonymous'
    }));

    return NextResponse.json(rankedData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
