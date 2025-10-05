// /src/hooks/useGmail.ts
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface ReplyToEmailParams {
  messageId: string;
  replyBody: string;
}

export function useGmail() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/profile');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async (query = '', maxResults = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        query,
        maxResults: maxResults.toString(),
      });
      const response = await fetch(`/api/gmail/messages?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async ({ to, subject, body, isHtml = false }: SendEmailParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body, isHtml }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const replyToEmail = async ({ messageId, replyBody }: ReplyToEmailParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, replyBody }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reply');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getUserProfile,
    getMessages,
    sendEmail,
    replyToEmail,
    loading,
    error,
  };
}