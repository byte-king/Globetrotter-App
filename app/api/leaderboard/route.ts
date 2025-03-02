import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get users ordered by highest score
    const users = await prisma.user.findMany({
      orderBy: {
        highestScore: 'desc'
      },
      select: {
        id: true,
        username: true,
        highestScore: true,
        scores: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            streak: true,
            difficulty: true,
            createdAt: true
          }
        }
      },
      take: 100
    });

    if (users.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Transform the data for the response
    const leaderboardData = users.map((user, index) => ({
      id: user.id,
      username: user.username || 'Anonymous',
      score: user.highestScore,
      streak: user.scores[0]?.streak || 0,
      difficulty: user.scores[0]?.difficulty || 'medium',
      rank: index + 1,
      createdAt: user.scores[0]?.createdAt || new Date()
    }));

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 