// pages/api/answer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });
    
  const { destinationId, guess } = req.body;
  
  if (!destinationId || !guess)
    return res.status(400).json({ error: 'Missing parameters' });
  
  try {
    const destination = await prisma.destination.findUnique({
      where: { id: Number(destinationId) }
    });
    
    if (!destination)
      return res.status(404).json({ error: 'Destination not found' });
    
    const isCorrect = destination.city.toLowerCase() === guess.toLowerCase();
    const feedback = isCorrect ? 'correct' : 'incorrect';
    
    // Parse funFacts and trivia JSON strings
    const funFacts = JSON.parse(destination.funFacts);
    const trivia = JSON.parse(destination.trivia);
    
    const messages = funFacts.concat(trivia);
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    res.status(200).json({ feedback, funMessage: randomMessage });
  } catch (error) {
    res.status(500).json({ error: 'Error processing answer' });
  }
}
