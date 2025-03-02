// pages/api/user/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });
    
  const { username, email, password } = req.body;
  
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Username, email, and password are required' });
  
  try {
    const user = await prisma.user.create({
      data: { 
        username,
        email,
        password, // Note: In a real app, this should be hashed
        normalizedUsername: username.toLowerCase()
      }
    });
    
    // Don't return sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Error registering user' });
    }
  }
}
