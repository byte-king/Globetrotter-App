import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationId, guess } = body;
    
    if (!destinationId || !guess) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        details: {
          destinationId: !destinationId ? 'Required field' : null,
          guess: !guess ? 'Required field' : null
        }
      }, { status: 400 });
    }

    // Fetch destination from Supabase
    const { data: destination, error } = await supabase
      .from('Destination')
      .select(`
        id,
        city,
        country,
        fun_facts,
        trivia,
        clues,
        difficulty
      `)
      .eq('id', destinationId)
      .single();

    if (error || !destination) {
      return NextResponse.json({ 
        error: 'Destination not found',
        details: `No destination found with ID: ${destinationId}`
      }, { status: 404 });
    }

    const isCorrect = destination.city.toLowerCase() === guess.toLowerCase();

    // Get random message from fun facts or trivia
    let messages: string[] = [];
    try {
      const funFacts = Array.isArray(destination.fun_facts) 
        ? destination.fun_facts 
        : JSON.parse(destination.fun_facts || '[]');
      
      const trivia = Array.isArray(destination.trivia)
        ? destination.trivia
        : JSON.parse(destination.trivia || '[]');

      messages = [...funFacts, ...trivia];
    } catch (parseError) {
      console.error('Error parsing fun facts or trivia:', parseError);
      messages = ['Did you know? This city has many interesting facts!'];
    }

    const randomMessage = messages.length > 0
      ? messages[Math.floor(Math.random() * messages.length)]
      : 'Interesting place to visit!';

    // Optional: Log the answer attempt
    try {
      await supabase
        .from('answer_logs')
        .insert([{
          destination_id: destinationId,
          guess: guess,
          is_correct: isCorrect,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.error('Failed to log answer attempt:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      isCorrect,
      feedback: isCorrect ? 'correct' : 'incorrect',
      funMessage: randomMessage,
      correctAnswer: isCorrect ? undefined : destination.city,
      additionalInfo: {
        country: destination.country,
        difficulty: destination.difficulty,
        remainingClues: destination.clues?.length || 0
      }
    });

  } catch (error) {
    console.error('Error processing answer:', error);
    return NextResponse.json({
      error: 'Failed to process answer',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
