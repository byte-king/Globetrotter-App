import { NextResponse } from 'next/server';
import prisma from './prisma';

/**
 * Helper function to handle database operations with proper error handling
 */
export async function withDb<T>(
  operation: () => Promise<T>,
  errorMessage = 'Database operation failed'
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : errorMessage 
    };
  }
}

/**
 * Helper function to handle database operations in API routes
 */
export async function dbHandler<T>(
  operation: () => Promise<T>,
  errorMessage = 'Database operation failed',
  errorStatus = 500
): Promise<NextResponse> {
  const result = await withDb(operation, errorMessage);
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: errorStatus });
  }
  
  return NextResponse.json(result.data);
}

export default prisma; 