// pages/api/challenge.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
    
  const { username } = req.query;
  if (!username || typeof username !== 'string')
    return res.status(400).json({ error: 'Username is required' });
  
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('username')
      .eq('username', username)
      .single();
    
    if (error || !user)
      return res.status(404).json({ error: 'User not found' });
    
    const inviteLink = `https://yourdomain.com/challenge/${user.username}`;
    const imageUrl = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(user.username)}`;
    
    res.status(200).json({
      inviteLink,
      imageUrl,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: `Error fetching challenge: ${error}` });
  }
}
