// pages/api/user/register.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Input validation
    if (!username || !email || !password) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: {
          username: !username ? 'Required field' : null,
          email: !email ? 'Required field' : null,
          password: !password ? 'Required field' : null
        }
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      }, { status: 400 });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        code: 'WEAK_PASSWORD'
      }, { status: 400 });
    }

    // Check if username or email already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('User')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return NextResponse.json({
        error: 'Username or email already exists',
        code: 'DUPLICATE_USER'
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('User')
      .insert([{
        username,
        normalizedUsername: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        highestScore: 0,
        totalGames: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id, username, email')
      .single();

    if (createError) throw createError;

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ 
      userId: newUser.id, 
      username: newUser.username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'Failed to register',
      code: 'REGISTRATION_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
