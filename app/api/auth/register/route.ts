import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser, error } = await supabaseAdmin
      .from('User')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

      if(error){
        return NextResponse.json(
          { error: 'Failed to check username or email' },
          { status: 500 }
        );
      }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('User')
      .insert([
        {
          username,
          normalizedUsername: username.toLowerCase(),
          email,
          password: hashedPassword,
          highestScore: 0,
          totalGames: 0
        }
      ])
      .select('id, username')
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
