import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationId, guess } = body;
    
    if (!destinationId || !guess) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    const destination = await prisma.destination.findUnique({
      where: { id: Number(destinationId) }
    });
    
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }
    
    const isCorrect = destination.city.toLowerCase() === guess.toLowerCase();
    const feedback = isCorrect ? 'correct' : 'incorrect';
    
    // Parse funFacts and trivia JSON strings
    const funFacts = JSON.parse(destination.funFacts);
    const trivia = JSON.parse(destination.trivia);
    
    const messages = funFacts.concat(trivia);
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return NextResponse.json({ feedback, funMessage: randomMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing answer' }, { status: 500 });
  }
} 