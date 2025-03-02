// pages/api/user/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });
    
  const { username } = req.body;
  
  if (!username)
    return res.status(400).json({ error: 'Username is required' });
  
  try {
    const user = await prisma.user.create({
      data: { username }
    });
    res.status(200).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') { // duplicate username error
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Error registering user' });
    }
  }
}
