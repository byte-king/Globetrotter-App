import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TokenData {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

export function getTokenData(token: string): TokenData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenData;
    return decoded;
  } catch (error) {
    return null;
  }
} 