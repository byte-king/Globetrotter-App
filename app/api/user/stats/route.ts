import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get user stats from the database
    const stats = await prisma.user.findFirst({
      select: {
        email: true,
        username: true,
        scores: {
          select: {
            value: true,
            streak: true,
            createdAt: true
          }
        }
      }
    });

    if (!stats) {
      return NextResponse.json({
        maxScore: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalGames: 0,
        averageScore: 0,
        email: '',
        username: ''
      });
    }

    // Calculate statistics
    const scores = stats.scores.map(s => s.value);
    const streaks = stats.scores.map(s => s.streak);
    
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
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

    return NextResponse.json({
      maxScore,
      currentStreak,
      maxStreak,
      totalGames,
      averageScore,
      email: stats.email || '',
      username: stats.username || ''
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
} 