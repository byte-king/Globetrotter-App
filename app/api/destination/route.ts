import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: destinations, error } = await supabase
      .from('Destination')
      .select('id, city, country, clues, fun_facts, trivia');

    if (error) throw error;
    
    if (!destinations?.length) {
      return NextResponse.json({ error: 'No destinations found' }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * destinations.length);
    const destination = destinations[randomIndex];
    
    return NextResponse.json({
      id: destination.id,
      city: destination.city,
      country: destination.country,
      clues: destination.clues,
      funFacts: destination.fun_facts,
      trivia: destination.trivia
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destination', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
