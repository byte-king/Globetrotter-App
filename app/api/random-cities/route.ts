import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeCity = searchParams.get('excludeCity');
    const count = Number(searchParams.get('count')) || 5;

    // Get total count for random offset
    const totalCities = await prisma.destination.count({
      where: excludeCity ? { city: { not: excludeCity } } : undefined
    });

    // Generate random offset
    const randomOffset = Math.floor(Math.random() * Math.max(0, totalCities - count));

    const cities = await prisma.destination.findMany({
      where: excludeCity ? { city: { not: excludeCity } } : undefined,
      select: { city: true },
      take: count,
      skip: randomOffset,
    });

    return NextResponse.json(cities.map(c => c.city));
  } catch (error) {
    console.error('Error fetching random cities:', error);
    return NextResponse.json({ error: 'Error fetching cities' }, { status: 500 });
  }
} 
