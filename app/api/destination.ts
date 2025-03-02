// pages/api/destination.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const destinations = await prisma.destination.findMany();
    const randomIndex = Math.floor(Math.random() * destinations.length);
    const destination = destinations[randomIndex];
    if (destination) {
      const parsedDestination = {
        ...destination,
        clues: JSON.parse(destination.clues),
        funFacts: JSON.parse(destination.funFacts),
        trivia: JSON.parse(destination.trivia)
      };
      res.status(200).json(parsedDestination);
    } else {
      console.log("There is no destination");
      res.status(404).json({ error: 'No destination found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching destination' });
  }
}
