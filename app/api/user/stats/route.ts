import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenData } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = getTokenData(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user stats from the database
    const stats = await prisma.user.findUnique({
      where: { id: userData.userId },
      select: {
        id: true,
        email: true,
        username: true,
        highestScore: true,
        scores: {
          select: {
            value: true,
            streak: true,
            createdAt: true,
            difficulty: true
          }
        }
      }
    });

    if (!stats) {
      return NextResponse.json({
        highestScore: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalGames: 0,
        averageScore: 0,
        email: '',
        username: '',
        id: null,
        ranking: 0,
        totalPlayers: 0
      });
    }

    // Calculate statistics
    const scores = stats.scores.map(s => s.value);
    const streaks = stats.scores.map(s => s.streak);
    
    const maxScore = stats.highestScore;
    const maxStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
    const totalGames = scores.length;
    const averageScore = totalGames > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / totalGames) 
      : 0;

    // Calculate current streak
    let currentStreak = 0;
    if (stats.scores.length > 0) {
      const sortedScores = [...stats.scores].sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastGameDate = new Date(sortedScores[0].createdAt);
      lastGameDate.setHours(0, 0, 0, 0);
      
      if (today.getTime() === lastGameDate.getTime()) {
        currentStreak = sortedScores[0].streak;
      }
    }

    // Calculate ranking based on highest scores
    const higherScores = await prisma.user.count({
      where: {
        highestScore: {
          gt: stats.highestScore
        }
      }
    });

    const totalPlayers = await prisma.user.count();
    const ranking = higherScores + 1;

    // Group scores by difficulty
    const difficultyStats = stats.scores.reduce((acc: Record<string, number>, score) => {
      acc[score.difficulty] = (acc[score.difficulty] || 0) + 1;
      return acc;
    }, {});

    // Get recent scores
    const recentScores = stats.scores
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(score => ({
        value: score.value,
        difficulty: score.difficulty,
        createdAt: score.createdAt
      }));

    return NextResponse.json({
      highestScore: maxScore,
      currentStreak,
      maxStreak,
      totalGames,
      averageScore,
      email: stats.email || '',
      username: stats.username || '',
      id: stats.id,
      ranking,
      totalPlayers,
      difficultyStats,
      recentScores
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
} 