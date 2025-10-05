// /src/pages/api/gmail/messages.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { GmailAPI } from '../../../lib/gmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gmail = new GmailAPI(session.accessToken as string);

    if (req.method === 'GET') {
      const { q, maxResults = '10' } = req.query;
      
      const messages = await gmail.listMessages(
        q as string, 
        parseInt(maxResults as string)
      );
      
      // Get full message details for each message
      const messageDetails = await Promise.all(
        (messages.messages || []).slice(0, 5).map(async (msg: any) => {
          const fullMessage = await gmail.getMessage(msg.id);
          return {
            id: fullMessage.id,
            snippet: fullMessage.snippet,
            sender: gmail.getSender(fullMessage),
            subject: gmail.getSubject(fullMessage),
            body: gmail.getMessageBody(fullMessage),
            labelIds: fullMessage.labelIds,
            threadId: fullMessage.threadId
          };
        })
      );

      res.status(200).json({
        messages: messageDetails,
        resultSizeEstimate: messages.resultSizeEstimate
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling messages:', error);
    res.status(500).json({ error: 'Failed to handle messages' });
  }
}