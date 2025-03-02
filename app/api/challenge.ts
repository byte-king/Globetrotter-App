// pages/api/challenge.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma"
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create a new PrismaClient instance for each request to avoid prepared statement conflicts

  
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
    
  const { username } = req.query;
  if (!username || typeof username !== 'string')
    return res.status(400).json({ error: 'Username is required' });
  
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    
    if (!user)
      return res.status(404).json({ error: 'User not found' });
    
    const inviteLink = `https://yourdomain.com/challenge/${user.username}`;
    // For demonstration, we use a placeholder image URL.
    const imageUrl = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(user.username)}`;
    
    res.status(200).json({
      inviteLink,
      imageUrl,
      score: user.score,
    });
  } catch (error) {
    res.status(500).json({ error: `Error generating challenge: ${error}` });
  }
}
