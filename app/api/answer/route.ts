import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationId, guess } = body;
    
    if (!destinationId || !guess) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        details: !destinationId ? 'destinationId is required' : 'guess is required'
      }, { status: 400 });
    }
    
    const destination = await prisma.destination.findUnique({
      where: { id: Number(destinationId) }
    });
    
    if (!destination) {
      return NextResponse.json({ 
        error: 'Destination not found',
        details: `No destination found with ID: ${destinationId}`
      }, { status: 404 });
    }
    
    const isCorrect = destination.city.toLowerCase() === guess.toLowerCase();
    const feedback = isCorrect ? 'correct' : 'incorrect';
    
    try {
      // Parse funFacts and trivia JSON strings
      const funFacts = JSON.parse(destination.funFacts);
      const trivia = JSON.parse(destination.trivia);
      
      const messages = funFacts.concat(trivia);
      const randomMessage = messages.length > 0 
        ? messages[Math.floor(Math.random() * messages.length)]
        : "Interesting place to visit!";
      
      return NextResponse.json({ feedback, funMessage: randomMessage });
    } catch (parseError) {
      console.error('Error parsing destination data:', parseError);
      // Still return feedback even if fun facts parsing fails
      return NextResponse.json({ 
        feedback, 
        funMessage: "Interesting place to visit!",
        warning: "Could not load additional information"
      });
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json({ 
      error: 'Error checking answer',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 