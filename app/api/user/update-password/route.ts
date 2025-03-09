import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenData } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const token = (await cookies()).get('auth-token')?.value;

    // Authentication checks
    if (!token) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const userData = getTokenData(token);
    if (!userData) {
      return NextResponse.json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // Input validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        error: 'Current password and new password are required',
        code: 'MISSING_FIELDS',
        fields: {
          currentPassword: !currentPassword,
          newPassword: !newPassword
        }
      }, { status: 400 });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        code: 'WEAK_PASSWORD'
      }, { status: 400 });
    }

    // Prevent reusing the same password
    if (currentPassword === newPassword) {
      return NextResponse.json({
        error: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
      }, { status: 400 });
    }

    // Get user with admin client for better security
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('id, password, email, updated_at')
      .eq('id', userData.userId)
      .single();

    if (userError || !user || !user.password) {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and last update timestamp
    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString(),
        password_changed_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      throw updateError;
    }

    // Optional: Send email notification about password change
    try {
      await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: 'Password Changed',
          template: 'password-changed',
          data: {
            username: userData.username,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (emailError) {
      console.error('Failed to send password change notification:', emailError);
      // Don't fail the request if email notification fails
    }

    return NextResponse.json({
      message: 'Password updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({
      error: 'Failed to update password',
      code: 'UPDATE_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
