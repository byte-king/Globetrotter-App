import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') || 'all';
    const timeRange = searchParams.get('timeRange') || 'all';

    // Calculate the date range
    const now = new Date();
    let dateFilter = {};
    if (timeRange === 'today') {
      const yesterday = new Date(now.setDate(now.getDate() - 1));
      dateFilter = { createdAt: { gte: yesterday } };
    } else if (timeRange === 'week') {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { gte: lastWeek } };
    } else if (timeRange === 'month') {
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { createdAt: { gte: lastMonth } };
    }

    // Build the where clause based on difficulty
    const difficultyFilter = difficulty !== 'all' ? { difficulty } : {};

    const scores = await prisma.score.findMany({
      where: {
        ...difficultyFilter,
        ...dateFilter,
      },
      orderBy: {
        value: 'desc',
      },
      take: 100,
      include: {
        user: true
      },
    });

    // Transform the data for the response
    const leaderboardData = scores.map(score => ({
      id: score.id,
      username: score.user?.username || `Player_${score.userId}`,
      score: score.value,
      streak: score.streak,
      difficulty: score.difficulty,
      createdAt: score.createdAt.toISOString(),
    }));

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 