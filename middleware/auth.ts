import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function verifyAuth(request: Request) {
  const token = (await cookies()).get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    console.log("VErification result",verified);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}