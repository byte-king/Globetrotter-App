import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeCity = searchParams.get('excludeCity'); // City to exclude from results
    const count = Number(searchParams.get('count')) || 5; // Number of cities to return, default 5

    const { data: cities, error } = await supabase
      .from('Destination')
      .select('city')
      .neq('city', excludeCity || '')
      .limit(count)
      .order('random()');

    if (error) throw error;

    return NextResponse.json(cities.map(c => c.city));
  } catch (error) {
    console.error('Error fetching random cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
