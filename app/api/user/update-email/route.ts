import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTokenData } from '@/lib/auth';
import {cookies} from "next/headers";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const token = (await cookies()).get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = getTokenData(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if email is already in use
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .neq('id', userData.userId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      );
    }
    else {
      console.log('Email is not in use',checkError);
    }

    // Update user's email
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update({ email })
      .eq('id', userData.userId)
      .select('email')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Email updated successfully',
      email: updatedUser.email
    });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
} 
