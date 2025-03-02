// app/api/scores/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Group scores by userId to get total players count
    const totalPlayers = await prisma.score.groupBy({
      by: ['userId'],
      _count: true,
    });

    // Get top 10 scores ordered by value descending with user info
    const scores = await prisma.score.findMany({
      orderBy: {
        value: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
      take: 10,
    });

    // Calculate ranks based on score
    let currentRank = 1;
    let previousScore: number | null = null;
    const rankedScores = scores.map((score, index) => {
      if (previousScore !== score.value) {
        currentRank = index + 1;
        previousScore = score.value;
      }
      return {
        id: score.id,
        value: score.value,
        streak: score.streak,
        difficulty: score.difficulty,
        username: score.user?.username || 'Anonymous',
        userId: score.user?.id || null,
        createdAt: score.createdAt,
        rank: currentRank,
        totalPlayers: totalPlayers.length,
      };
    });

    return NextResponse.json({ scores: rankedScores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      {
        error: 'Error fetching scores',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { score, streak, difficulty, userId } = await request.json() as {
      score: number;
      streak: number;
      difficulty: string;
      userId: number;
    };

    if (score === undefined || streak === undefined || !difficulty || !userId) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          details: 'score, streak, difficulty, and userId are required',
        },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', details: `No user found with ID: ${userId}` },
        { status: 404 }
      );
    }

    // Create score record
    const scoreRecord = await prisma.score.create({
      data: {
        value: score,
        streak,
        difficulty,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    // Update user's highest score if necessary
    if (score > user.highestScore) {
      await prisma.user.update({
        where: { id: user.id },
        data: { highestScore: score },
      });
    }

    // Calculate rank for this score
    const higherScores = await prisma.score.count({
      where: { value: { gt: score } },
    });
    const totalPlayersForRank = await prisma.$queryRaw<{ totalPlayers: number }[]>`
      SELECT COUNT(DISTINCT "userId") AS "totalPlayers" FROM "Score"
    `;
    const rank = higherScores + 1;
    const isNewRecord = rank === 1;

    return NextResponse.json({
      score: scoreRecord.value,
      isNewRecord,
      rank,
      totalPlayers: totalPlayersForRank.length,
      username: user.username,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      {
        error: 'Error saving score',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
