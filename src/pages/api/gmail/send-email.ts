// /src/pages/api/gmail/send-email.ts
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

    const { to, subject, body, isHtml, textBody } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    const gmail = new GmailAPI(session.accessToken as string);
    
    let result;
    if (isHtml) {
      result = await gmail.sendHtmlEmail(to, subject, body, textBody);
    } else {
      result = await gmail.sendEmail(to, subject, body);
    }

    res.status(200).json({ 
      success: true, 
      messageId: result.id,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}