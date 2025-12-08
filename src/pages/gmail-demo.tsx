import React from 'react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import API from '@/utils/axios';
import Logo from "@/components/Logo";
import {
  Mail,
  Send,
  LogOut,
  ArrowLeft,
  Loader2,
  Inbox,
  Eye,
  RefreshCw,
  User,
  X,
  Unlock
} from 'lucide-react';
import Link from 'next/link';

// Gmail Messages Interface
interface GmailMessage {
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
  body?: string;
  labelIds?: string[];
  bodyContent?: string;
  isEncrypted?: boolean;
  displaySubject?: string;
}

export default function GmailDemo() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    isHtml: false,
    type: 'AES' as 'AES' | 'QKD'
  });

  // Get email body content helper function
  const getEmailBodyContent = (email: GmailMessage) => {
    if (email.body) return email.body;
    if (email.snippet) return email.snippet;
    if (email.payload?.body?.data) {
      try {
        return atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } catch (e) {
        return email.payload.body.data;
      }
    }
    return '';
  };

  // Updated function to detect encrypted emails - simpler detection
  const parseEmailContent = (email: GmailMessage) => {
    const bodyContent = getEmailBodyContent(email);
    
    const isEncrypted = (
      email.subject?.includes('🔐') ||
      email.subject?.includes('[Encrypted]') ||
      bodyContent?.includes('--- ENCRYPTED METADATA ---') ||
      bodyContent?.includes('--- ENCRYPTED PAYLOAD ---')
    );

    console.log(`📧 Email ${email.id} - Encrypted: ${isEncrypted} :: Body - ${bodyContent}`);

    return {
      ...email,
      bodyContent: bodyContent,
      isEncrypted,
      displaySubject: email.subject?.replace(/🔐\s*/, '').replace(/\s*\[Encrypted\]$/, '') || 'No Subject'
    };
  };

  // Simplified frontend extraction function
  const extractEncryptedData = (emailBody: string) => {
    try {
      const metadataJson = emailBody.split('--- ENCRYPTED METADATA ---')[1].split('--- ENCRYPTED PAYLOAD ---')[0].trim();

      const encryptedPayload = emailBody.split('--- ENCRYPTED PAYLOAD ---')[1].split('--- END ENCRYPTED MESSAGE ---')[0].trim().replace(/\s+/g, '');

      console.log(`Metadata - ${metadataJson} ---- Payload - ${encryptedPayload}`);

      return {
        metadata: JSON.parse(metadataJson),
        encryptedPayload: encryptedPayload
      };
    } catch (error) {
      console.error('Error extracting data:', error);
      return null;
    }
  };

  // Updated email preview function
  const getEmailPreview = (email: GmailMessage) => {
    if (email.isEncrypted) {
      return "🔐 Encrypted message - click to decrypt";
    }
    
    const bodyText = email.bodyContent || email.snippet || '';
    const plainText = bodyText.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  // Fetch Gmail messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmail/messages?maxResults=20', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Gmail API Response:', data);
        
        // Convert the Gmail API response to our GmailMessage format
        const rawMessages: GmailMessage[] = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          payload: {
            headers: [
              { name: 'From', value: msg.sender || 'Unknown Sender' },
              { name: 'Subject', value: msg.subject || 'No Subject' }
            ],
            body: { data: '' },
            parts: []
          },
          internalDate: Date.now().toString(),
          sender: msg.sender,
          subject: msg.subject,
          body: msg.body
        }));
        
        // Parse emails for encryption detection
        const formattedMessages = rawMessages.map(parseEmailContent);
        setMessages(formattedMessages);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch messages:', errorData);
        alert('Failed to fetch emails: ' + (errorData.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('Error fetching messages: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load messages on component mount
  React.useEffect(() => {
    if (session && activeTab === 'inbox') {
      fetchMessages();
    }
  }, [session, activeTab]);

  // Fetch full email content
  const fetchEmailContent = async (messageId: string) => {
    try {
      const response = await fetch(`/api/gmail/messages/${messageId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const emailData = await response.json();
        return emailData;
      } else {
        console.error('Failed to fetch email content');
        return null;
      }
    } catch (error) {
      console.error('Error fetching email content:', error);
      return null;
    }
  };

  // Handle viewing an email
  const handleViewEmail = async (message: GmailMessage) => {
    const parsedMessage = parseEmailContent(message);
    setSelectedEmail(parsedMessage);
    setShowViewer(true);
    setDecryptedContent(null); // Reset decrypted content
    
    // Fetch full content if needed
    const fullContent = await fetchEmailContent(message.id);
    if (fullContent) {
      const updatedMessage = {
        ...parsedMessage,
        body: fullContent.body || message.body || message.snippet,
        bodyContent: fullContent.body || message.body || message.snippet
      };
      const finalParsedMessage = parseEmailContent(updatedMessage);
      setSelectedEmail(finalParsedMessage);
    }
  };

  // Simplified decryption function
  const decryptEmail = async () => {
    if (!selectedEmail || !selectedEmail.isEncrypted) return;

    try {
      setDecryptLoading(true);
      
      console.log('🔓 Extracting encrypted data...');
      console.log('📝 Body content preview:', selectedEmail.bodyContent?.substring(0, 200));
      
      // Extract data from email body
      const extractedData = extractEncryptedData(selectedEmail.bodyContent || '');
      if (!extractedData) {
        throw new Error('Could not extract encrypted data from email');
      }

      console.log('✅ Extracted data successfully');
      console.log('📦 Payload length:', extractedData.encryptedPayload.length);
      console.log('👤 Sender:', selectedEmail.sender);
      console.log("encryptedPayload: ",extractedData.encryptedPayload);
      console.log("metadata: ",extractedData.metadata);

      // Send directly to decrypt endpoint
      const response = await API.post('/auth/decrypt-email',{encryptedPayload:extractedData.encryptedPayload, 
        metadata:extractedData.metadata, senderEmail:selectedEmail.sender});

      if (response && response.data) {
        const message = response.data.message;
        // Convert to string if it's an object
        const messageText = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        setDecryptedContent(messageText);
        console.log('✅ Decryption successful!', response.data);
      } else {
        throw new Error('Failed to decrypt - no response data');
      }

    } catch (error) {
      console.error('❌ Decryption failed:', error);
      alert('Failed to decrypt email: ' + (error as Error).message);
    } finally {
      setDecryptLoading(false);
    }
  };

  // Handle email sending
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/send-encrypted-email', emailForm);
      console.log("Email sent successfully:", res);
      alert('Email sent successfully!');
      setEmailForm({ to: '', subject: '', body: '', isHtml: false, type: 'AES' });
    } catch (err: any) {
      console.log("Failed to send email:", err.message);
      alert('Failed to send email: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md mx-4 shadow-xl">
          <div className="flex justify-center mb-6">
            <Logo className="h-12 w-auto" priority alt="QuMail" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Required</h1>
          <p className="text-gray-400 mb-6">Connect your Gmail account to access quantum-secured email features</p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
          >
            <span>Connect Gmail</span>
          </Link>
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <p className="text-xs text-gray-500">Secure • Quantum-Protected • Enterprise Ready</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-700"></div>
              <div className="flex items-center space-x-3">
                <Logo className="h-8 sm:h-9 w-auto" />
                <p className="text-gray-400 text-sm hidden sm:block">Quantum-Secured Email</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Gmail Active</span>
                </div>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <img
                    className="h-8 w-8 rounded-lg border-2 border-gray-700"
                    src={session.user.image}
                    alt="Profile"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors duration-300 border border-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="relative z-10 max-w-6xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 mb-6 shadow-xl">
          <nav className="grid grid-cols-2 gap-2">
            {[
              { key: 'inbox', label: 'Inbox', Icon: Inbox },
              { key: 'compose', label: 'Compose Email', Icon: Send }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto pb-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'inbox' && (
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Inbox className="w-6 h-6 mr-3" />
                Gmail Inbox
              </h2>
              <button
                onClick={fetchMessages}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
                <p className="text-white/80">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/80">No messages found</p>
                <button
                  onClick={fetchMessages}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Load Messages
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const date = message.internalDate ? new Date(parseInt(message.internalDate)).toLocaleDateString() : 'Unknown Date';
                  const preview = getEmailPreview(message);
                  const from = message.sender || 'Unknown Sender';
                  const subject = message.subject || 'No Subject';
                  
                  return (
                    <div 
                      key={message.id} 
                      className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 sm:p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3 gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg truncate">{subject}</h3>
                          <p className="text-sm text-gray-400 truncate">From: {from}</p>
                          <p className="text-xs text-white/50 mt-1">{date}</p>
                        </div>
                        <button 
                          onClick={() => handleViewEmail(message)}
                          className="px-3 py-1 sm:px-4 sm:py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-1 flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">{preview}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'compose' && (
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <Send className="w-6 h-6 mr-3 text-blue-400" />
              Compose New Email
            </h2>
          
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">To</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({...emailForm, to: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Encryption Type</label>
                <select
                  value={emailForm.type}
                  onChange={(e) => setEmailForm({...emailForm, type: e.target.value as 'AES' | 'QKD'})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="AES" className="bg-gray-800 text-white">AES - Advanced Encryption Standard</option>
                  <option value="QKD" className="bg-gray-800 text-white">QKD - Quantum Key Distribution</option>
                </select>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  {emailForm.type === 'AES' ? (
                    <>
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Classical encryption using symmetric key cryptography
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      Quantum-safe encryption with quantum key distribution
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Message</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                  rows={10}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Type your message here..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Email Viewer Modal */}
      {showViewer && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-800/50 border-b border-gray-700/50 p-4 sm:p-6 flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {selectedEmail.displaySubject || selectedEmail.subject || 'No Subject'}
                  </h2>
                  {selectedEmail.isEncrypted && (
                    <span className="text-yellow-400 text-sm bg-yellow-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
                      🔐 Encrypted
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm mt-1">
                  From: {selectedEmail.sender || 'Unknown Sender'}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {selectedEmail.internalDate 
                    ? new Date(parseInt(selectedEmail.internalDate)).toLocaleString()
                    : 'Unknown Date'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowViewer(false)}
                className="ml-4 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {selectedEmail.isEncrypted ? (
                <div className="space-y-4">
                  {/* Decryption Button */}
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 sm:p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Unlock className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Encrypted Email</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      This email contains encrypted content. Click decrypt to view the message.
                    </p>
                    <button
                      onClick={decryptEmail}
                      disabled={decryptLoading}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 mx-auto"
                    >
                      {decryptLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Decrypting...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" />
                          <span>Decrypt Email</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Decrypted Content */}
                  {decryptedContent && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                        ✅ Decrypted Content
                      </h4>
                      <div className="text-white/90 whitespace-pre-wrap break-words">
                        {decryptedContent}
                      </div>
                    </div>
                  )}
                  
                  {/* Raw Encrypted Content (for debugging) */}
                  <details className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                    <summary className="text-gray-400 cursor-pointer text-sm font-medium hover:text-gray-300 transition-colors">
                      View Raw Encrypted Content (Debug)
                    </summary>
                    <div className="mt-3 text-xs text-gray-500 font-mono whitespace-pre-wrap break-all">
                      {selectedEmail.bodyContent?.substring(0, 1000)}
                      {(selectedEmail.bodyContent?.length || 0) > 1000 && '...'}
                    </div>
                  </details>
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 sm:p-6">
                  {selectedEmail.bodyContent || selectedEmail.body ? (
                    <div className="text-gray-100 whitespace-pre-wrap break-words">
                      {(selectedEmail.bodyContent || selectedEmail.body || '').replace(/<[^>]*>/g, '')}
                    </div>
                  ) : (
                    <p className="text-gray-300">
                      {selectedEmail.snippet || 'No content available'}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700/50 p-4 sm:p-6 flex justify-end">
              <button
                onClick={() => setShowViewer(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}