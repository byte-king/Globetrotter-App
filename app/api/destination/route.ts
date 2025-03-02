import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany();
    const randomIndex = Math.floor(Math.random() * destinations.length);
    const destination = destinations[randomIndex];
    
    if (destination) {
      const parsedDestination = {
        ...destination,
        clues: JSON.parse(destination.clues),
        funFacts: JSON.parse(destination.funFacts),
        trivia: JSON.parse(destination.trivia)
      };
      return NextResponse.json(parsedDestination);
    } else {
      console.log("There is no destination");
      return NextResponse.json({ error: 'No destination found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: `Error fetching destination: ${error}` }, { status: 500 });
  }
} 