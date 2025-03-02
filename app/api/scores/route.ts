import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First get total number of players
    const totalPlayers = await prisma.score.groupBy({
      by: ['userId'],
      _count: true
    });

    // Get all scores ordered by value with user information
    const scores = await prisma.score.findMany({
      orderBy: {
        value: 'desc'
      },
      include: {
        user: {
          select: {
            username: true,
            id: true
          }
        }
      },
      take: 10
    });

    // Calculate ranks based on score
    let currentRank = 1;
    let previousScore: number | null = null;
    const rankedScores = scores.map((score, index) => {
      // If score is same as previous, keep same rank
      if (previousScore === score.value) {
        // Don't increment currentRank
      } else {
        currentRank = index + 1;
        previousScore = score.value;
      }

      return {
        id: score.id,
        value: score.value,
        streak: score.streak,
        difficulty: score.difficulty,
        username: score.user?.username || `Anonymous`,
        userId: score.user?.id || null,
        createdAt: score.createdAt,
        rank: currentRank,
        totalPlayers: totalPlayers.length
      };
    });

    return NextResponse.json({
      scores: rankedScores
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ 
      error: 'Error fetching scores',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
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

    // Validate input parameters
    if (score === undefined || streak === undefined || !difficulty || !userId) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        details: 'score, streak, difficulty, and userId are required'
      }, { status: 400 });
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        details: `No user found with ID: ${userId}`
      }, { status: 404 });
    }

    // Create score record with user association
    const scoreRecord = await prisma.score.create({
      data: {
        value: score,
        streak,
        difficulty,
        userId: user.id
      },
      include: {
        user: {
          select: {
            username: true,
            id: true
          }
        }
      }
    });

    // Update user's highest score if necessary
    if (score > user.highestScore) {
      await prisma.user.update({
        where: { id: user.id },
        data: { highestScore: score }
      });
    }

    // Calculate rank for this score
    const higherScores = await prisma.score.count({
      where: {
        value: {
          gt: score
        }
      }
    });

    const totalPlayers = await prisma.score.groupBy({
      by: ['userId'],
      _count: true
    });

    const rank = higherScores + 1;
    const isNewRecord = rank === 1;

    return NextResponse.json({
      score: scoreRecord.value,
      isNewRecord,
      rank,
      totalPlayers: totalPlayers.length,
      username: user.username,
      userId: user.id
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ 
      error: 'Error saving score',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}