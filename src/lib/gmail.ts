// /src/lib/gmail.ts
import { Session } from "next-auth";

export interface GmailMessage {
  id: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      mimeType: string;
      body: { data?: string };
    }>;
    body?: { data?: string };
  };
  labelIds: string[];
  threadId: string;
}

export interface UserProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export class GmailAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://gmail.googleapis.com/gmail/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Get user profile information
  async getUserProfile(): Promise<UserProfile> {
    return this.makeRequest('/users/me/profile');
  }

  // Get user's detailed information from Google People API
  async getUserInfo() {
    const peopleUrl = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,phoneNumbers,addresses,birthdays,organizations';
    
    const response = await fetch(peopleUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`People API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // List messages with optional query
  async listMessages(query?: string, maxResults: number = 10) {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(query && { q: query }),
    });

    return this.makeRequest(`/users/me/messages?${params}`);
  }

  // Get a specific message
  async getMessage(messageId: string): Promise<GmailMessage> {
    return this.makeRequest(`/users/me/messages/${messageId}`);
  }

  // Send an email
  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = false) {
    const message = [
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    // Base64 encode the message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.makeRequest('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });
  }

  // Send HTML email
  async sendHtmlEmail(to: string, subject: string, htmlBody: string, textBody?: string) {
    const boundary = Math.random().toString(36).substring(7);
    
    let message = [
      'MIME-Version: 1.0',
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      textBody || htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      '',
      htmlBody,
      '',
      `--${boundary}--`
    ].join('\n');

    // Base64 encode the message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.makeRequest('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });
  }

  // Reply to an email
  async replyToEmail(messageId: string, replyBody: string) {
    const originalMessage = await this.getMessage(messageId);
    const headers = originalMessage.payload.headers;
    
    const messageIdHeader = headers.find(h => h.name === 'Message-ID')?.value || '';
    const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '';
    const fromHeader = headers.find(h => h.name === 'From')?.value || '';
    
    const subject = subjectHeader.startsWith('Re:') ? subjectHeader : `Re: ${subjectHeader}`;
    
    const message = [
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      `To: ${fromHeader}`,
      `Subject: ${subject}`,
      `In-Reply-To: ${messageIdHeader}`,
      `References: ${messageIdHeader}`,
      '',
      replyBody
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.makeRequest('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        raw: encodedMessage,
        threadId: originalMessage.threadId,
      }),
    });
  }

  // Mark messages as read
  async markAsRead(messageIds: string[]) {
    return this.makeRequest('/users/me/messages/batchModify', {
      method: 'POST',
      body: JSON.stringify({
        ids: messageIds,
        removeLabelIds: ['UNREAD'],
      }),
    });
  }

  // Mark messages as unread
  async markAsUnread(messageIds: string[]) {
    return this.makeRequest('/users/me/messages/batchModify', {
      method: 'POST',
      body: JSON.stringify({
        ids: messageIds,
        addLabelIds: ['UNREAD'],
      }),
    });
  }

  // Delete messages
  async deleteMessages(messageIds: string[]) {
    return this.makeRequest('/users/me/messages/batchDelete', {
      method: 'POST',
      body: JSON.stringify({
        ids: messageIds,
      }),
    });
  }

  // Get message body content
  getMessageBody(message: GmailMessage): string {
    let body = '';

    if (message.payload.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString();
          break;
        }
      }
    }

    return body;
  }

  // Extract sender from message
  getSender(message: GmailMessage): string {
    const fromHeader = message.payload.headers.find(h => h.name === 'From');
    return fromHeader?.value || '';
  }

  // Extract subject from message
  getSubject(message: GmailMessage): string {
    const subjectHeader = message.payload.headers.find(h => h.name === 'Subject');
    return subjectHeader?.value || '';
  }
}