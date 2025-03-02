import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

// List of auth-required routes (protected routes)
const protectedRoutes = ['/dashboard', '/play', '/profile', '/api/user'];

// List of auth-only routes (routes only for non-authenticated users)
const authOnlyRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for non-auth API routes and static files
  if ((pathname.startsWith('/api/') && !pathname.startsWith('/api/user')) || 
      pathname === '/' || 
      pathname.startsWith('/_next') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get auth token
  const token = request.cookies.get('token')?.value;

  // Check if token is valid
  const isValidToken = token ? await isTokenValid(token) : false;

  // If user is authenticated and tries to access auth-only routes (login/register)
  if (isValidToken && authOnlyRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and tries to access protected routes
  if (!isValidToken && protectedRoutes.some(route => pathname.startsWith(route))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Helper function to verify JWT token
async function isTokenValid(token: string): Promise<boolean> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return !!payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 