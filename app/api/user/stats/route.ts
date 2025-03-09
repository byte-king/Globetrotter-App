import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTokenData } from '@/lib/auth';
import {cookies} from "next/headers";

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = getTokenData(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('User')
      .select(`
        id,
        email,
        username,
        highestScore,
        Score (
          id,
          value,
          streak,
          difficulty,
          createdAt
        )
      `)
      .eq('id', userData.userId)
      .single();

    if (error) throw error;

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
} 
