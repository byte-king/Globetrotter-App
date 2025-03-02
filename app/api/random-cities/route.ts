import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"
export async function GET(request: Request) {
  // Create a new PrismaClient instance for this request

  
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const excludeCity = searchParams.get('excludeCity'); // City to exclude from results
    const count = Number(searchParams.get('count')) || 5; // Number of cities to return, default 5

    // Get random cities from the database
    const cities = await prisma.$queryRaw<Array<{ city: string }>>`
      SELECT city 
      FROM "Destination" 
      WHERE city != ${excludeCity || ''}
      ORDER BY RANDOM() 
      LIMIT ${count}
    `;

    return NextResponse.json(cities.map(c => c.city));
  } catch (error) {
    console.error('Error fetching random cities:', error);
    return NextResponse.json({ error: 'Error fetching cities' }, { status: 500 });
  } 
} 