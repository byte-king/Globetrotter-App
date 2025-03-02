import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

const prisma = new PrismaClient();

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: '',
  length: 3,
  style: 'capital'
};

export async function GET() {
  try {
    let username: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Keep generating until we find a unique username or hit max attempts
    while (!isUnique && attempts < maxAttempts) {
      username = uniqueNamesGenerator(customConfig);
      
      // Add random numbers if we're not on the first attempt
      if (attempts > 0) {
        username += Math.floor(Math.random() * 1000);
      }

      // Check if username exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (!existingUser) {
        isUnique = true;
        return NextResponse.json({ username });
      }

      attempts++;
    }

    // If we couldn't generate a unique username after max attempts
    if (!isUnique) {
      // Generate a username with timestamp to ensure uniqueness
      username = `Player${Date.now()}`;
      return NextResponse.json({ username });
    }

  } catch (error) {
    console.error('Error generating username:', error);
    return NextResponse.json(
      { error: 'Failed to generate username' },
      { status: 500 }
    );
  }
} 