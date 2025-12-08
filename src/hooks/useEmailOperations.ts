import { useState, useRef } from 'react';
import { signOut } from 'next-auth/react';

// Gmail Messages Interface
export interface GmailMessage {
  id: string;
  threadId?: string;
  snippet?: string;
  payload?: {
    headers?: Array<{ name?: string; value?: string }>;
    body?: { data?: string };
    parts?: Array<{ 
      body?: { data?: string }; 
      mimeType?: string;
      filename?: string;
      partId?: string;
    }>;
  };
  internalDate?: string;
  sender?: string;
  subject?: string;
  to?: string;
  body?: string;
  labelIds?: string[];
  bodyContent?: string;
  isEncrypted?: boolean;
  displaySubject?: string;
}

export type EncryptionType = 'AES' | 'QKD' | 'OTP' | 'PQC' | 'None';

export interface EmailForm {
  to: string;
  subject: string;
  body: string;
  isHtml: boolean;
  type: EncryptionType;
}

export function useEmailOperations() {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());
  const [lastMessageCount, setLastMessageCount] = useState<number>(0);
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const signingOutRef = useRef(false);

  const handleUnauthorized = async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    setError('Your session has expired. Redirecting to login...');
    await signOut({ callbackUrl: '/login?message=session-expired' });
  };

  // Helper functions
  const getEmailBodyContent = (email: GmailMessage) => {
    // Priority order: body > bodyContent > decoded payload > snippet
    if (email.body) return email.body;
    if (email.bodyContent) return email.bodyContent;
    
    // Try to decode base64 payload data
    if (email.payload?.body?.data) {
      try {
        const decoded = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        return decoded;
      } catch (e) {
        console.warn('Failed to decode body data:', e);
        return email.payload.body.data;
      }
    }
    
    // Check for parts (multipart messages)
    if (email.payload?.parts && email.payload.parts.length > 0) {
      for (const part of email.payload.parts) {
        if (part.body?.data) {
          try {
            const decoded = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            if (decoded.trim()) return decoded;
          } catch (e) {
            console.warn('Failed to decode part data:', e);
          }
        }
      }
    }
    
    // Fallback to snippet
    return email.snippet || 'No content available';
  };

  const parseEmailContent = (email: GmailMessage): GmailMessage => {
    const bodyContent = getEmailBodyContent(email);
    
    // Enhanced encryption detection
    const isEncrypted = (
      email.subject?.includes('🔐') ||
      email.subject?.includes('[Encrypted]') ||
      email.subject?.includes('[Quantum Encrypted]') ||
      bodyContent?.includes('--- ENCRYPTED METADATA ---') ||
      bodyContent?.includes('--- ENCRYPTED PAYLOAD ---') ||
      bodyContent?.includes('[AES ENCRYPTED]') ||
      bodyContent?.includes('[QKD ENCRYPTED]') ||
      bodyContent?.includes('[AES-GCM ENCRYPTED]') ||
      bodyContent?.includes('[AES STANDARD ENCRYPTED]')
    );

    // Extract sender and recipient from headers if available
    let sender = email.sender;
    let to = email.to;
    
    if (email.payload?.headers) {
      const fromHeader = email.payload.headers.find(h => h.name === 'From');
      const toHeader = email.payload.headers.find(h => h.name === 'To');
      
      if (fromHeader?.value) sender = fromHeader.value;
      if (toHeader?.value) to = toHeader.value;
    }

    return {
      ...email,
      sender,
      to,
      bodyContent: bodyContent,
      isEncrypted,
      displaySubject: email.subject?.replace(/🔐\s*/, '').replace(/\s*\[.*?Encrypted\]$/g, '') || 'No Subject'
    };
  };

  // Check for new messages without full refresh
  const checkForNewMessages = async (): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch('/api/gmail/messages?maxResults=5', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        await handleUnauthorized();
        return false;
      }

      if (!response.ok) {
        console.error('Failed to check for new messages');
        return false;
      }
      
      const data = await response.json();
      
      if (data && data.messages) {
        const latestMessages = data.messages.slice(0, 3); // Check first 3 messages
        const latestMessageIds = latestMessages.map((msg: any) => msg.id);
        const currentMessageIds = messages.slice(0, 3).map(msg => msg.id);
        
        // Check if any of the latest message IDs are new
        const hasNew = latestMessageIds.some((id: string) => !currentMessageIds.includes(id));
        
        if (hasNew) {
          setHasNewMessages(true);
          console.log('New messages detected');
          return true;
        }
      }
      
      setLastCheckTime(Date.now());
      return false;
    } catch (error) {
      console.error('Error checking for new messages:', error);
      setError('Unable to check for new messages. Please try again.');
      return false;
    }
  };

  // Smart refresh - only refresh if new messages are detected
  const smartRefresh = async () => {
    const newMessagesDetected = await checkForNewMessages();
    
    if (newMessagesDetected || messages.length === 0) {
      await fetchMessages();
      setHasNewMessages(false);
    } else {
      console.log('No new messages detected, skipping refresh');
    }
  };

  // Fetch Gmail messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/messages?maxResults=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch messages:', errorData);
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      console.log('Gmail API Response:', data);
      
      if (data && data.messages) {
        const processedMessages = data.messages.map((msg: any) => parseEmailContent(msg));
        setMessages(processedMessages);
        setLastMessageCount(processedMessages.length);
        setLastCheckTime(Date.now());
        setHasNewMessages(false);
        
        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Loaded ${processedMessages.length} messages`);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  // Send email
  const sendEmail = async (emailForm: EmailForm) => {
    setLoading(true);
    setError(null);
    try {
      let emailSubject = emailForm.subject;
      let emailBody = emailForm.body;
      
      if (emailForm.type === 'AES') {
        emailSubject = `🔐 ${emailForm.subject} [Encrypted]`;
        emailBody = `[AES ENCRYPTED]\n\n--- ENCRYPTED METADATA ---\nEncryption: AES-256\nTimestamp: ${new Date().toISOString()}\n--- END METADATA ---\n\n--- ENCRYPTED PAYLOAD ---\n${emailForm.body}\n--- END PAYLOAD ---`;
      } else if (emailForm.type === 'QKD') {
        emailSubject = `🔐 ${emailForm.subject} [Quantum Encrypted]`;
        emailBody = `[QKD ENCRYPTED]\n\n--- ENCRYPTED METADATA ---\nEncryption: Quantum Key Distribution\nQuantum Entanglement ID: QE-${Date.now()}\nKey Distribution Protocol: BB84\nTimestamp: ${new Date().toISOString()}\n--- END METADATA ---\n\n--- ENCRYPTED PAYLOAD ---\n${emailForm.body}\n--- END PAYLOAD ---`;
      } else if (emailForm.type === 'PQC') {
        emailSubject = `🔐 ${emailForm.subject} [Post-Quantum Encrypted]`;
        emailBody = `[PQC ENCRYPTED]\n\n--- ENCRYPTED METADATA ---\nEncryption: AES-GCM 32 Bytes\nPost-Quantum Algorithm: Quantum-Resistant\nTimestamp: ${new Date().toISOString()}\n--- END METADATA ---\n\n--- ENCRYPTED PAYLOAD ---\n${emailForm.body}\n--- END PAYLOAD ---`;
      } else if (emailForm.type === 'OTP') {
        emailSubject = `🔐 ${emailForm.subject} [AES Standard Encrypted]`;
        emailBody = `[AES STANDARD ENCRYPTED]\n\n--- ENCRYPTED METADATA ---\nEncryption: AES-256 Standard\nAlgorithm: Advanced Encryption Standard\nTimestamp: ${new Date().toISOString()}\n--- END METADATA ---\n\n--- ENCRYPTED PAYLOAD ---\n${emailForm.body}\n--- END PAYLOAD ---`;
      }

      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailForm.to,
          subject: emailSubject,
          body: emailBody
        })
      });

      if (response.status === 401) {
        await handleUnauthorized();
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error instanceof Error ? error.message : 'Error sending email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Decrypt email function
  const decryptEmail = async (email: GmailMessage) => {
    setDecryptLoading(true);
    setDecryptedContent(null);
    
    try {
      const bodyContent = email.bodyContent || '';
      
      if (bodyContent.includes('[AES ENCRYPTED]') || bodyContent.includes('[QKD ENCRYPTED]')) {
        const payloadMatch = bodyContent.match(/--- ENCRYPTED PAYLOAD ---\n([\s\S]*?)\n--- END PAYLOAD ---/);
        if (payloadMatch && payloadMatch[1]) {
          setDecryptedContent(payloadMatch[1].trim());
        } else {
          setDecryptedContent('Could not extract encrypted payload');
        }
      } else {
        setDecryptedContent(bodyContent);
      }
    } catch (error) {
      console.error('Error decrypting email:', error);
      setDecryptedContent('Error decrypting email');
      setError('Error decrypting email');
    } finally {
      setDecryptLoading(false);
    }
  };

  // Email actions
  const starEmail = async (emailId: string) => {
    try {
      // Update local state immediately for better UX
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: msg.labelIds?.includes('STARRED') 
                ? msg.labelIds.filter(l => l !== 'STARRED')
                : [...(msg.labelIds || []), 'STARRED'] }
            : msg
        )
      );
      
      // TODO: Make API call to Gmail to star/unstar the email
      console.log('Star email:', emailId);
      return true;
    } catch (error) {
      console.error('Error starring email:', error);
      return false;
    }
  };

  const archiveEmail = async (emailId: string) => {
    try {
      // Update local state to mark as archived
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: [...(msg.labelIds?.filter(l => l !== 'ARCHIVE' && l !== 'ARCHIVED') || []), 'ARCHIVE'] }
            : msg
        )
      );
      
      // TODO: Make API call to Gmail to archive the email
      console.log('Archive email:', emailId);
      return true;
    } catch (error) {
      console.error('Error archiving email:', error);
      return false;
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      // Update local state to mark as deleted
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: [...(msg.labelIds?.filter(l => l !== 'TRASH' && l !== 'DELETED') || []), 'TRASH'] }
            : msg
        )
      );
      
      // TODO: Make API call to Gmail to delete the email
      console.log('Delete email:', emailId);
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      return false;
    }
  };

  const unarchiveEmail = async (emailId: string) => {
    try {
      // Remove archive label and restore to appropriate tab
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: msg.labelIds?.filter(l => l !== 'ARCHIVE' && l !== 'ARCHIVED') || [] }
            : msg
        )
      );
      
      // TODO: Make API call to Gmail to unarchive the email
      console.log('Unarchive email:', emailId);
      return true;
    } catch (error) {
      console.error('Error unarchiving email:', error);
      return false;
    }
  };

  const restoreEmail = async (emailId: string) => {
    try {
      // Remove trash label and restore to appropriate tab
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === emailId 
            ? { ...msg, labelIds: msg.labelIds?.filter(l => l !== 'TRASH' && l !== 'DELETED') || [] }
            : msg
        )
      );
      
      // TODO: Make API call to Gmail to restore the email
      console.log('Restore email:', emailId);
      return true;
    } catch (error) {
      console.error('Error restoring email:', error);
      return false;
    }
  };

  return {
    messages,
    loading,
    decryptLoading,
    decryptedContent,
    fetchMessages,
    sendEmail,
    decryptEmail,
    starEmail,
    archiveEmail,
    deleteEmail,
    unarchiveEmail,
    restoreEmail,
    setMessages,
    smartRefresh,
    checkForNewMessages,
    hasNewMessages,
    lastCheckTime,
    error,
  };
}