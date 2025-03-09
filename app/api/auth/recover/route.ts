import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, email')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (user.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match the registered account' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    const { error: updateError } = await supabase
      .from('User')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: 'Account recovered successfully' });
  } catch (error) {
    console.error('Account recovery error:', error);
    return NextResponse.json(
      { error: 'Failed to recover account', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
