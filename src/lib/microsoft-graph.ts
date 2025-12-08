// Microsoft Graph API helper for Outlook/Office365 emails

const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0';

export interface OutlookMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
}

/**
 * Fetch messages from Outlook using Microsoft Graph API
 */
export async function fetchOutlookMessages(
  accessToken: string,
  maxResults = 50
): Promise<OutlookMessage[]> {
  try {
    const response = await fetch(
      `${GRAPH_API_ENDPOINT}/me/mailFolders/inbox/messages?$top=${maxResults}&$orderby=receivedDateTime DESC`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Outlook messages:', error);
    throw error;
  }
}

/**
 * Fetch sent items from Outlook using Microsoft Graph API
 */
export async function fetchOutlookSentItems(
  accessToken: string,
  maxResults = 50
): Promise<OutlookMessage[]> {
  try {
    const response = await fetch(
      `${GRAPH_API_ENDPOINT}/me/mailFolders/sentitems/messages?$top=${maxResults}&$orderby=receivedDateTime DESC`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Outlook sent items:', error);
    throw error;
  }
}

/**
 * Fetch junk/spam emails from Outlook using Microsoft Graph API
 */
export async function fetchOutlookJunkItems(
  accessToken: string,
  maxResults = 50
): Promise<OutlookMessage[]> {
  try {
    const response = await fetch(
      `${GRAPH_API_ENDPOINT}/me/mailFolders/junkemail/messages?$top=${maxResults}&$orderby=receivedDateTime DESC`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Outlook junk items:', error);
    throw error;
  }
}

/**
 * Get a specific message by ID
 */
export async function getOutlookMessage(
  accessToken: string,
  messageId: string
): Promise<OutlookMessage> {
  try {
    const response = await fetch(
      `${GRAPH_API_ENDPOINT}/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Outlook message:', error);
    throw error;
  }
}

/**
 * Send an email via Outlook
 */
export async function sendOutlookEmail(
  accessToken: string,
  emailData: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
  }
): Promise<void> {
  try {
    const message = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: emailData.isHtml ? 'HTML' : 'Text',
          content: emailData.body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: emailData.to,
            },
          },
        ],
      },
    };

    const response = await fetch(`${GRAPH_API_ENDPOINT}/me/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send email');
    }
  } catch (error) {
    console.error('Error sending Outlook email:', error);
    throw error;
  }
}

/**
 * Mark a message as read
 */
export async function markOutlookMessageAsRead(
  accessToken: string,
  messageId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${GRAPH_API_ENDPOINT}/me/messages/${messageId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error marking Outlook message as read:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteOutlookMessage(
  accessToken: string,
  messageId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${GRAPH_API_ENDPOINT}/me/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting Outlook message:', error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getOutlookProfile(accessToken: string) {
  try {
    const response = await fetch(`${GRAPH_API_ENDPOINT}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Outlook profile:', error);
    throw error;
  }
}
