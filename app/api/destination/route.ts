import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const totalDestinations = await prisma.destination.count();
    const randomSkip = Math.floor(Math.random() * totalDestinations);
    
    const destination = await prisma.destination.findFirst({
      skip: randomSkip,
    });
    
    if (destination) {
      try {
        const parsedDestination = {
          ...destination,
          clues: JSON.parse(destination.clues || '[]'),
          funFacts: JSON.parse(destination.funFacts || '[]'),
          trivia: JSON.parse(destination.trivia || '[]')
        };
        return NextResponse.json(parsedDestination);
      } catch (parseError) {
        console.error('Error parsing JSON fields:', parseError);
        return NextResponse.json({ error: 'Data format error' }, { status: 500 });
      }
    } else {
      console.log("No destination found");
      return NextResponse.json({ error: 'No destination found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json({ error: 'Error fetching destination' }, { status: 500 });
  }
} 
