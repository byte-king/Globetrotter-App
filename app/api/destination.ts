// pages/api/destination.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: destinations, error } = await supabase
      .from('Destination')
      .select(`
        id,
        city,
        country,
        clues,
        fun_facts,
        trivia,
        difficulty
      `);

    if (error) throw error;

    if (!destinations?.length) {
      return NextResponse.json({ 
        error: 'No destinations found',
        code: 'NO_DESTINATIONS'
      }, { status: 404 });
    }

    // Get a random destination
    const randomIndex = Math.floor(Math.random() * destinations.length);
    const destination = destinations[randomIndex];

    // Parse JSON strings if needed
    const parsedDestination = {
      id: destination.id,
      city: destination.city,
      country: destination.country,
      clues: parseJsonSafely(destination.clues, []),
      funFacts: parseJsonSafely(destination.fun_facts, []),
      trivia: parseJsonSafely(destination.trivia, []),
      difficulty: destination.difficulty
    };

    // Cache headers for performance
    const headers = {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    };

    return NextResponse.json(parsedDestination, { headers });
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json({
      error: 'Failed to fetch destination',
      code: 'FETCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to safely parse JSON
function parseJsonSafely(jsonString: string | null, defaultValue: string[] = []) {
  if (!jsonString) return defaultValue;
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
