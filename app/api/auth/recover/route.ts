import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
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
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: 'Account recovered successfully' });
  } catch (error) {
    console.error('Account recovery error:', error);
    return NextResponse.json(
      { error: 'Failed to recover account' },
      { status: 500 }
    );
  }
} 