// app/api/scores/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user's scores
    const { data: scores, error: scoresError } = await supabaseAdmin
      .from('Score')
      .select(`
        id,
        value,
        streak,
        difficulty,
        createdAt,
        userId
      `)
      .eq('userId', userId)
      .order('value', { ascending: false })
      .limit(10);

    if (scoresError) throw scoresError;

    // Get user info
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('username')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const formattedScores = (scores || []).map((score, index) => ({
      id: score.id,
      username: user?.username || 'Anonymous',
      value: score.value,
      streak: score.streak || 0,
      difficulty: score.difficulty || 'N/A',
      createdAt: score.createdAt,
      rank: index + 1,
      userId: score.userId
    }));

    return NextResponse.json({ 
      scores: formattedScores,
      stats: {
        totalGames: scores?.length || 0,
        highestScore: Math.max(...(scores?.map(s => s.value) || [0])),
        averageScore: scores?.length 
          ? Math.round(scores.reduce((acc, s) => acc + s.value, 0) / scores.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching user scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, score, streak, difficulty } = await request.json();

    if (!userId || score === undefined || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a transaction
    const { data: newScore, error: scoreError } = await supabaseAdmin
      .from('Score')
      .insert([
        {
          userId: userId,
          value: score,
          streak: streak || 0,
          difficulty
        }
      ])
      .select()
      .single();

    if (scoreError) throw scoreError;

    // Update user's highest score if necessary
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('highestScore')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!user.highestScore || score > user.highestScore) {
      const { error: updateError } = await supabaseAdmin
        .from('User')
        .update({ highestScore: score })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    return NextResponse.json({
      message: 'Score saved successfully',
      score: newScore
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
