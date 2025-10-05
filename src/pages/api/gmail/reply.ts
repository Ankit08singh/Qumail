// /src/pages/api/gmail/reply.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { GmailAPI } from '../../../lib/gmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { messageId, replyBody } = req.body;

    if (!messageId || !replyBody) {
      return res.status(400).json({ error: 'Missing required fields: messageId, replyBody' });
    }

    const gmail = new GmailAPI(session.accessToken as string);
    const result = await gmail.replyToEmail(messageId, replyBody);

    res.status(200).json({ 
      success: true, 
      messageId: result.id,
      message: 'Reply sent successfully' 
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
}