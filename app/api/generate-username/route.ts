import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

export async function GET() {
  try {
    // Test the connection with a simpler query
    const { data:newData, error: testError } = await supabaseAdmin
      .from('User')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Connection test failed:', testError);
      throw testError;
    }
    else{
      console.log('Connection test passed:', newData);
    }

    // Generate username logic
    const customConfig: Config = {
      dictionaries: [adjectives, colors, animals],
      separator: '',
      length: 3,
      style: 'capital'
    };

    let username = uniqueNamesGenerator(customConfig);
    
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('username')
      .ilike('username', username)
      .limit(1);

    if (error) {
      console.error('Username check failed:', error);
      throw error;
    }

    if (data && data.length > 0) {
      username += Math.floor(Math.random() * 1000);
    }

    return NextResponse.json({ username, success: true });

  } catch (error) {
    console.error('Error in username generation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate username',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
} 
