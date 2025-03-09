// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const timeRange = searchParams.get('timeRange');

    // First, get user stats for highest scores
    let userQuery = supabase
      .from('User')
      .select(`
        id,
        username,
        highestScore,
        Score!score_user_id_fkey (
          id,
          streak,
          difficulty,
          createdAt
        )
      `)
      .order('highestScore', { ascending: false });

    if (difficulty && difficulty !== 'all') {
      userQuery = userQuery.eq('Score.difficulty', difficulty);
    }

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      userQuery = userQuery.gte('Score.createdAt', startDate.toISOString());
    }

    const { data: users, error: usersError } = await userQuery.limit(100);

    if (usersError) {
      console.error('Users query error:', usersError);
      throw usersError;
    }

    // Calculate stats
    const rankedData = (users || []).map((user, index) => {
      const latestScore = user.Score?.[0] || {};
      return {
        rank: index + 1,
        id: user.id,
        username: user.username || 'Anonymous',
        score: user.highestScore,
        streak: latestScore.streak || 0,
        difficulty: latestScore.difficulty || 'N/A',
        createdAt: latestScore.createdAt || new Date().toISOString()
      };
    });

    // Calculate global stats
    const stats = {
      totalPlayers: users?.length || 0,
      highestScore: Math.max(...(users?.map(u => u.highestScore) || [0])),
      averageScore: users?.length 
        ? Math.round(users.reduce((acc, user) => acc + user.highestScore, 0) / users.length)
        : 0,
      totalGames: users?.reduce((acc, user) => acc + (user.Score?.length || 0), 0) || 0
    };

    return NextResponse.json({
      rankings: rankedData,
      stats
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard data', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }, 
      { status: 500 }
    );
  }
}
