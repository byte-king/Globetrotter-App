// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const leaderboard = await prisma.user.findMany({
      where: {
        scores: {
          some: {}
        }
      },
      select: {
        id: true,
        username: true,
        highestScore: true,
        streak: true,
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            difficulty: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { highestScore: 'desc' },
        { username: 'asc' }
      ],
      take: 100
    });

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      id: entry.id,
      username: entry.username,
      score: entry.highestScore,
      streak: entry.streak,
      difficulty: entry.scores[0]?.difficulty || 'unknown',
      createdAt: entry.scores[0]?.createdAt || new Date().toISOString()
    }));

    return NextResponse.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}
