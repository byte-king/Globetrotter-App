import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    
    const { data: destination, error } = await supabase
      .from('Destination')
      .select('city, fun_facts, trivia, clues')
      .eq('id', destinationId)
      .single();
    
    if (error || !destination) {
      return NextResponse.json({ 
        error: 'Destination not found',
        details: `No destination found with ID: ${destinationId}`
      }, { status: 404 });
    }
    
    const isCorrect = destination.city.toLowerCase() === guess.toLowerCase();
    
    return NextResponse.json({
      isCorrect,
      correctAnswer: destination.city,
      funFacts: destination.fun_facts,
      trivia: destination.trivia,
      clues: destination.clues
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    return NextResponse.json(
      { error: 'Failed to process answer', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
