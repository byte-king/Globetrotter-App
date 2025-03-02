import { NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: '',
  length: 3,
  style: 'capital'
};

export async function GET() {
  // Create a new PrismaClient instance for this request
  // This helps avoid prepared statement conflicts in development with hot reloading

  
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

      try {
        // Check if username exists - with error handling
        const existingUser = await prisma.user.findFirst({
          where: { username },
          select: { id: true }
        });

        if (!existingUser) {
          isUnique = true;
          return NextResponse.json({ username });
        }
      } catch (queryError) {
        console.warn('Query error, trying alternative approach:', queryError);
        // If the query fails, generate a unique username with timestamp
        // This is a fallback to ensure we still return something useful
        username = `Player${Date.now()}${Math.floor(Math.random() * 1000)}`;
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

    // This should never be reached due to the returns above, but TypeScript needs it
    return NextResponse.json({ username: `Player${Date.now()}` });

  } catch (error) {
    console.error('Error generating username:', error);
    return NextResponse.json(
      { error: 'Failed to generate username' },
      { status: 500 }
    );
  } 
} 