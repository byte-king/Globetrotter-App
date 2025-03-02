import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { isValidUsername, normalizeUsername, isValidEmail } from '@/app/utils/validation';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Validate username format
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username must contain only letters' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedUsername = normalizeUsername(username);

    // Check if username already exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        normalizedUsername: normalizedUsername
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        normalizedUsername,
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 