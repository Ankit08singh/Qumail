import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Archive, 
  Trash2, 
  MoreHorizontal, 
  Shield, 
  CheckCircle, 
  Paperclip,
  Undo, 
  Download, 
  ExternalLink,
  Reply,
  ReplyAll,
  Forward,
  Link,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';
import API from '@/utils/axios';

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
  to?: string;
  subject?: string;
  body?: string;
  labelIds?: string[];
  bodyContent?: string;
  isEncrypted?: boolean;
  displaySubject?: string;
}

interface EmailViewerProps {
  email: GmailMessage;
  onBack: () => void;
  onStarEmail: (emailId: string) => void;
  onArchiveEmail: (emailId: string) => void;
  onDeleteEmail: (emailId: string) => void;
  activeView?: string;
}

const EmailViewer: React.FC<EmailViewerProps> = ({ email, onBack, onStarEmail, onArchiveEmail, onDeleteEmail, activeView }) => {
  // State for decryption
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [emailBodyContent, setEmailBodyContent] = useState<string>(email.bodyContent || email.body || '');

  // Extract encrypted data from email body
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

  // Decrypt email function
  const decryptEmail = async () => {
    if (!email || !email.isEncrypted) return;

    try {
      setDecryptLoading(true);
      
      console.log('🔓 Extracting encrypted data...');
      console.log('📝 Body content preview:', email.bodyContent?.substring(0, 200));
      
      // Extract data from email body
      const extractedData = extractEncryptedData(email.bodyContent || '');
      if (!extractedData) {
        throw new Error('Could not extract encrypted data from email');
      }

      console.log('✅ Extracted data successfully');
      console.log('📦 Payload length:', extractedData.encryptedPayload.length);
      console.log('👤 Sender:', email.sender);
      console.log("encryptedPayload: ",extractedData.encryptedPayload);
      console.log("metadata: ",extractedData.metadata);

      // Send directly to decrypt endpoint
      const response = await API.post('/auth/decrypt-email',{
        encryptedPayload:extractedData.encryptedPayload, 
        metadata:extractedData.metadata, 
        senderEmail:email.sender
      });

      if (response && response.data) {
        const message = response.data.message;
        // Convert to string if it's an object
        const messageText = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        setDecryptedContent(messageText);
        // Update the email body content to show decrypted message
        setEmailBodyContent(messageText);
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

  const getTimeAgo = (internalDate: string) => {
    const date = new Date(parseInt(internalDate));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatDateTime = (internalDate: string) => {
    const date = new Date(parseInt(internalDate));
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Top Header with Back Button and Subject */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to emails</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {/* Star button - available in all views except trash */}
            {activeView !== 'trash' && (
              <button 
                onClick={() => onStarEmail(email.id)}
                className={`p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  email.labelIds?.includes('STARRED') 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                title={email.labelIds?.includes('STARRED') ? 'Remove star' : 'Add star'}
              >
                <Star className={`w-5 h-5 ${email.labelIds?.includes('STARRED') ? 'fill-current' : ''}`} />
              </button>
            )}
            
            {/* Archive/Unarchive button */}
            {activeView === 'archive' ? (
              <button 
                onClick={() => onArchiveEmail(email.id)}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Unarchive"
              >
                <Undo className="w-5 h-5" />
              </button>
            ) : activeView !== 'trash' && (
              <button 
                onClick={() => onArchiveEmail(email.id)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Archive"
              >
                <Archive className="w-5 h-5" />
              </button>
            )}
            
            {/* Delete/Restore button */}
            {activeView === 'trash' ? (
              <button 
                onClick={() => onDeleteEmail(email.id)}
                className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Restore"
              >
                <Undo className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => onDeleteEmail(email.id)}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subject and Encryption Badges */}
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{email.subject}</h1>
          <div className="flex items-center space-x-2">
            {email.isEncrypted && (
              <>
                <div className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold">
                  SECURE
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-bold">
                  ENCRYPTED
                </div>
              </>
            )}
          </div>
        </div>

        {/* From/To/Time Information */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">From: </span>
            <span className="text-gray-900 dark:text-white font-medium">{email.sender || 'Unknown sender'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">To: </span>
            <span className="text-gray-900 dark:text-white font-medium">{email.to || 'Unknown recipient'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">📅</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {email.internalDate ? formatDateTime(email.internalDate) : 'Date not available'}
            </span>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="mt-4 flex items-center space-x-3">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <ReplyAll className="w-4 h-4" />
            <span>Reply All</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Forward className="w-4 h-4" />
            <span>Forward</span>
          </button>
        </div>
      </div>

      {/* Email Body - Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-lg p-6 mb-6">
            <div className="text-gray-800 dark:text-gray-300 leading-relaxed text-base break-words overflow-wrap-anywhere">
              {/* Display main email content */}
              {decryptedContent ? (
                // Show decrypted content
                <div className="whitespace-pre-wrap">
                  <div className="flex items-center space-x-2 mb-4">
                    <Unlock className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">Decrypted Message</span>
                  </div>
                  {decryptedContent}
                </div>
              ) : (
                <div className={`${email.isEncrypted && emailBodyContent ? 'font-mono text-sm break-all' : 'whitespace-pre-wrap'}`}>
                  {emailBodyContent || email.snippet || (
                    <div className="text-gray-600 dark:text-gray-400 italic">
                      <p>No content available for this email.</p>
                      <div className="mt-4 p-4 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                        <strong>Debug Info:</strong>
                        <br />Body Content: {email.bodyContent ? 'Available' : 'None'}
                        <br />Body: {email.body ? 'Available' : 'None'}  
                        <br />Snippet: {email.snippet ? email.snippet : 'None'}
                        <br />Has Payload: {email.payload ? 'Yes' : 'No'}
                        {email.payload?.body?.data && <><br />Payload Body Data: Available</>}
                        {email.payload?.parts && <><br />Payload Parts: {email.payload.parts.length}</>}
                      </div>
                    </div>
                  )}
                </div>
              )
              }
            </div>
          </div>

          {/* Show encrypted content details if available */}
          {email.isEncrypted && email.bodyContent && !decryptedContent && (
            <div className="bg-blue-100/50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Encrypted Email</span>
                </div>
                <button
                  onClick={decryptEmail}
                  disabled={decryptLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {decryptLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Decrypting...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Decrypt Message</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Check for encryption metadata */}
              {email.bodyContent.includes('--- ENCRYPTED METADATA ---') && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Encryption Information:</h4>
                  <div className="bg-gray-200 dark:bg-gray-800 rounded p-3 text-xs text-gray-600 dark:text-gray-400 font-mono break-all overflow-hidden">
                    {email.bodyContent.match(/--- ENCRYPTED METADATA ---\n([\s\S]*?)\n--- END METADATA ---/)?.[1] || 'Metadata not available'}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                This message is encrypted. Click "Decrypt Message" to view the content.
              </div>
            </div>
          )}

          {/* Show additional message info if available */}
          {email.payload && (
            <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Message Details</h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Message ID: {email.id}</div>
                {email.threadId && <div>Thread ID: {email.threadId}</div>}
                {email.labelIds && email.labelIds.length > 0 && (
                  <div>Labels: {email.labelIds.join(', ')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;