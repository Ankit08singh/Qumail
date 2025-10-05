// /src/pages/api/gmail/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { GmailAPI } from '../../../lib/gmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated - No session' });
    }

    if (!session.accessToken) {
      return res.status(401).json({ error: 'Not authenticated - No access token' });
    }

    console.log('Session found, attempting Gmail API call...');
    const gmail = new GmailAPI(session.accessToken as string);
    
    // Try to get Gmail profile first
    const gmailProfile = await gmail.getUserProfile();
    console.log('Gmail profile fetched successfully');
    
    // Try to get user info (this might fail if permissions are missing)
    let userInfo = null;
    try {
      userInfo = await gmail.getUserInfo();
    } catch (userInfoError) {
      console.log('User info fetch failed (this is optional):', userInfoError);
    }

    res.status(200).json({
      gmail: gmailProfile,
      userInfo: userInfo || { message: 'User info not available' }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}