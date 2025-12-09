import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Return the raw JWT token string
    const cookies = req.cookies;
    const sessionToken = cookies['next-auth.session-token'] || 
                        cookies['__Secure-next-auth.session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token found' });
    }
    
    res.status(200).json({ 
      token: sessionToken,
      provider: (token as any).provider || 'google',
      email: token.email
    });
  } catch (error) {
    console.error('Error getting token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
