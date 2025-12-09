import { useState, useRef } from 'react';
import { fetchOutlookMessages, fetchOutlookSentItems, fetchOutlookJunkItems, sendOutlookEmail, OutlookMessage } from '@/lib/microsoft-graph';
import { GmailMessage } from './useEmailOperations';

export function useOutlookOperations(accessToken: string | undefined) {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());
  const [lastMessageCount, setLastMessageCount] = useState<number>(0);
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);

  // Convert Outlook message to Gmail-compatible format
  const convertOutlookToGmail = (outlookMsg: OutlookMessage, isSent: boolean = false, isJunk: boolean = false): GmailMessage => {
    const labels = outlookMsg.isRead ? [] : ['UNREAD'];
    if (isSent) {
      labels.push('SENT');
    }
    if (isJunk) {
      labels.push('SPAM');
    }

    const bodyContent = outlookMsg.body?.content || '';
    const subject = outlookMsg.subject || '(No subject)';
    
    // Detect encryption markers (same logic as Gmail)
    const isEncrypted = (
      subject.includes('[Encrypted]') ||
      subject.includes('[Quantum Encrypted]') ||
      bodyContent.includes('--- ENCRYPTED METADATA ---') ||
      bodyContent.includes('--- ENCRYPTED PAYLOAD ---') ||
      bodyContent.includes('[AES ENCRYPTED]') ||
      bodyContent.includes('[QKD ENCRYPTED]') ||
      bodyContent.includes('[AES-GCM ENCRYPTED]') ||
      bodyContent.includes('[AES STANDARD ENCRYPTED]') ||
      bodyContent.includes('[OTP ENCRYPTED]') ||
      bodyContent.includes('[PQC ENCRYPTED]')
    );
    
    return {
      id: outlookMsg.id,
      threadId: outlookMsg.id,
      snippet: outlookMsg.bodyPreview,
      sender: outlookMsg.from?.emailAddress?.address || '',
      subject: subject,
      to: outlookMsg.toRecipients?.[0]?.emailAddress?.address || '',
      body: bodyContent,
      bodyContent: bodyContent,
      internalDate: new Date(outlookMsg.receivedDateTime).getTime().toString(),
      labelIds: labels,
      isEncrypted: isEncrypted,
      displaySubject: subject.replace(/🔐\s*/, '').replace(/\s*\[.*?Encrypted\]$/g, '') || '(No subject)',
      payload: {
        headers: [
          { name: 'From', value: outlookMsg.from?.emailAddress?.address },
          { name: 'To', value: outlookMsg.toRecipients?.[0]?.emailAddress?.address },
          { name: 'Subject', value: subject },
        ],
      },
    };
  };

  const fetchMessages = async () => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch inbox, sent items, and junk emails
      const [inboxMessages, sentMessages, junkMessages] = await Promise.all([
        fetchOutlookMessages(accessToken, 50),
        fetchOutlookSentItems(accessToken, 50),
        fetchOutlookJunkItems(accessToken, 50),
      ]);
      
      // Convert and combine messages
      const convertedInbox = inboxMessages.map(msg => convertOutlookToGmail(msg, false, false));
      const convertedSent = sentMessages.map(msg => convertOutlookToGmail(msg, true, false));
      const convertedJunk = junkMessages.map(msg => convertOutlookToGmail(msg, false, true));
      const allMessages = [...convertedInbox, ...convertedSent, ...convertedJunk];
      
      // Sort by date
      allMessages.sort((a, b) => parseInt(b.internalDate || '0') - parseInt(a.internalDate || '0'));
      
      setMessages(allMessages);
      setLastMessageCount(allMessages.length);
      setLastCheckTime(Date.now());
    } catch (err: any) {
      console.error('Error fetching Outlook messages:', err);
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const checkForNewMessages = async () => {
    if (!accessToken) return;

    try {
      const [inboxMessages, sentMessages, junkMessages] = await Promise.all([
        fetchOutlookMessages(accessToken, 10),
        fetchOutlookSentItems(accessToken, 10),
        fetchOutlookJunkItems(accessToken, 10),
      ]);
      
      const totalCount = inboxMessages.length + sentMessages.length + junkMessages.length;
      
      if (totalCount > lastMessageCount) {
        setHasNewMessages(true);
      }
    } catch (err) {
      console.error('Error checking for new Outlook messages:', err);
    }
  };

  const sendEmail = async (emailForm: { to: string[]; subject: string; body: string; isHtml?: boolean; type?: string }) => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Use the same backend endpoint as Gmail
      const API = (await import('@/utils/axios')).default;
      const response = await API.post('/auth/send-encrypted-email', emailForm);
      
      if (!response || !response.data) {
        throw new Error('Failed to send email - no response data');
      }
      
      console.log('Outlook email sent via backend:', response.data);
    } catch (err: any) {
      console.error('Error sending Outlook email:', err);
      throw err;
    }
  };

  // Decrypt email function (call backend API like Gmail)
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  const decryptEmail = async (email: GmailMessage) => {
    setDecryptLoading(true);
    setDecryptedContent(null);
    
    try {
      const bodyContent = email.bodyContent || '';
      
      // Check if email has encryption markers
      if (bodyContent.includes('--- ENCRYPTED METADATA ---') && bodyContent.includes('--- ENCRYPTED PAYLOAD ---')) {
        // Extract encrypted data from email body
        const metadataMatch = bodyContent.match(/--- ENCRYPTED METADATA ---\n([\s\S]*?)\n--- END METADATA ---/);
        const payloadMatch = bodyContent.match(/--- ENCRYPTED PAYLOAD ---\n([\s\S]*?)\n--- END/);
        
        if (metadataMatch && payloadMatch) {
          const metadataJson = metadataMatch[1].trim();
          const encryptedPayload = payloadMatch[1].trim().replace(/\s+/g, '');
          
          // Parse metadata
          let metadata: any = {};
          try {
            // Try parsing as JSON first
            metadata = JSON.parse(metadataJson);
          } catch {
            // If not JSON, parse key-value pairs
            metadataJson.split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim();
              }
            });
          }
          
          // Call backend API to decrypt
          const API = (await import('@/utils/axios')).default;
          const response = await API.post('/auth/decrypt-email', {
            encryptedPayload: encryptedPayload,
            metadata: metadata,
            senderEmail: email.sender
          });
          
          if (response && response.data) {
            const message = response.data.message;
            const messageText = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
            setDecryptedContent(messageText);
          } else {
            throw new Error('Failed to decrypt - no response data');
          }
        } else {
          setDecryptedContent('Could not extract encrypted payload');
        }
      } else {
        // Not encrypted, just show the content
        setDecryptedContent(bodyContent);
      }
    } catch (error) {
      console.error('Error decrypting email:', error);
      setDecryptedContent('Error decrypting email: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setError('Error decrypting email');
    } finally {
      setDecryptLoading(false);
    }
  };

  // Email actions (local state management like Gmail)
  const starEmail = async (emailId: string) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: msg.labelIds?.includes('STARRED') 
                ? msg.labelIds.filter(l => l !== 'STARRED')
                : [...(msg.labelIds || []), 'STARRED'] }
            : msg
        )
      );
      console.log('Star email:', emailId);
      return true;
    } catch (error) {
      console.error('Error starring email:', error);
      return false;
    }
  };

  const archiveEmail = async (emailId: string) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: [...(msg.labelIds?.filter(l => l !== 'ARCHIVE' && l !== 'ARCHIVED') || []), 'ARCHIVE'] }
            : msg
        )
      );
      console.log('Archive email:', emailId);
      return true;
    } catch (error) {
      console.error('Error archiving email:', error);
      return false;
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: [...(msg.labelIds?.filter(l => l !== 'TRASH' && l !== 'DELETED') || []), 'TRASH'] }
            : msg
        )
      );
      console.log('Delete email:', emailId);
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      return false;
    }
  };

  const unarchiveEmail = async (emailId: string) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: msg.labelIds?.filter(l => l !== 'ARCHIVE' && l !== 'ARCHIVED') || [] }
            : msg
        )
      );
      console.log('Unarchive email:', emailId);
      return true;
    } catch (error) {
      console.error('Error unarchiving email:', error);
      return false;
    }
  };

  const restoreEmail = async (emailId: string) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: msg.labelIds?.filter(l => l !== 'TRASH' && l !== 'DELETED') || [] }
            : msg
        )
      );
      console.log('Restore email:', emailId);
      return true;
    } catch (error) {
      console.error('Error restoring email:', error);
      return false;
    }
  };

  const smartRefresh = async () => {
    await fetchMessages();
  };

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendEmail,
    checkForNewMessages,
    hasNewMessages,
    lastCheckTime,
    decryptLoading,
    decryptedContent,
    decryptEmail,
    starEmail,
    archiveEmail,
    deleteEmail,
    unarchiveEmail,
    restoreEmail,
    smartRefresh,
  };
}
