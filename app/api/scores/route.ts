// app/api/scores/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get unique players count
    const totalPlayers = await prisma.user.count();

    // Get top 10 scores with user info
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

    // Map and rank the scores
    const rankedScores = scores.map((score, index) => ({
      rank: index + 1,
      id: score.id,
      value: score.value,
      username: score.user?.username || 'Anonymous',
      userId: score.user?.id,
      streak: score.streak,
      difficulty: score.difficulty,
      createdAt: score.createdAt
    }));

    return NextResponse.json({
      totalPlayers,
      scores: rankedScores
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { score, streak, difficulty, userId } = await request.json();

    if (!score || !difficulty || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create score and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newScore = await tx.score.create({
        data: {
          value: score,
          streak: streak || 0,
          difficulty,
          userId
        }
      });

      // Update user's highest score if needed
      await tx.user.update({
        where: { id: userId },
        data: {
          highestScore: {
            set: Math.max(score, await tx.user.findUnique({ 
              where: { id: userId },
              select: { highestScore: true }
            }).then(user => user?.highestScore || 0))
          },
          streak: streak || 0
        }
      });

      return newScore;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}
