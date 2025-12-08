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
    mimeType?: string;
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
      console.log("encryptedPayload: ", extractedData.encryptedPayload);
      console.log("metadata: ", extractedData.metadata);

      // Send directly to decrypt endpoint
      const response = await API.post('/auth/decrypt-email', {
        encryptedPayload: extractedData.encryptedPayload,
        metadata: extractedData.metadata,
        senderEmail: email.sender
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
      <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to emails</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Star button - available in all views except trash */}
              {activeView !== 'trash' && (
                <button
                  onClick={() => onStarEmail(email.id)}
                  className={`p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${email.labelIds?.includes('STARRED')
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
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">
              {email.subject}
            </h1>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {email.isEncrypted && (
                <>
                  <div className="bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold">
                    SECURE
                  </div>
                  <div className="bg-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold">
                    ENCRYPTED
                  </div>
                </>
              )}
            </div>
          </div>

          {/* From/To/Time Information */}
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-gray-500 dark:text-gray-400">From: </span>
                <span className="text-gray-900 dark:text-white font-medium break-all">{email.sender || 'Unknown sender'}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 text-gray-500 dark:text-gray-400 flex-shrink-0">
                <span>📅</span>
                <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">
                  {email.internalDate ? formatDateTime(email.internalDate) : 'Date not available'}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 dark:text-gray-400">To: </span>
              <span className="text-gray-900 dark:text-white font-medium break-all">{email.to || 'Unknown recipient'}</span>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm w-full sm:w-auto">
                <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Reply</span>
              </button>
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm w-full sm:w-auto">
                <ReplyAll className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reply All</span>
                <span className="sm:hidden">All</span>
              </button>
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm w-full sm:w-auto">
                <Forward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Forward</span>
                <span className="sm:hidden">Fwd</span>
              </button>
            </div>

            {email.isEncrypted && !decryptedContent && (
              <button
                onClick={decryptEmail}
                disabled={decryptLoading}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 text-white rounded-lg transition-colors w-full sm:w-auto"
                aria-label={decryptLoading ? 'Decrypting message' : 'Decrypt message'}
                title={decryptLoading ? 'Decrypting message' : 'Decrypt message'}
              >
                {decryptLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span className="sr-only">Decrypt message</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Email Body - Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-lg lg:rounded-2xl p-3 sm:p-4 md:p-6">
              <div className="text-gray-800 dark:text-gray-300 leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere">
                {/* Display main email content */}
                {decryptedContent ? (
                  // Show decrypted content (always as plain text)
                  <div className="whitespace-pre-wrap">
                    <div className="flex items-center space-x-2 mb-4">
                      <Unlock className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 dark:text-green-400 font-semibold">Decrypted Message</span>
                    </div>
                    {decryptedContent}
                  </div>
                ) : (
                  <div className={`${email.isEncrypted && emailBodyContent ? 'font-mono text-sm break-all' : ''}`}>
                    {(() => {
                      const content = emailBodyContent || email.snippet || '';

                      // Check if content is HTML - relaxed check
                      // If it has HTML tags or we determined it was HTML during extraction (by it being assigned to bodyContent when it was from a text/html part)
                      // we should render it as HTML.
                      const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
                      const isLikelyHtml = hasHtmlTags || (email.payload?.mimeType === 'text/html');

                      if (isLikelyHtml && !email.isEncrypted) {
                        // Render HTML content
                        return (
                          <div
                            className="email-content dark:text-gray-300"
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        );
                      } else {
                        // Render as plain text
                        return (
                          <div className="whitespace-pre-wrap">
                            {content || (
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
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Show encrypted content details if available */}
            {email.isEncrypted && email.bodyContent && !decryptedContent && (
              <div className="bg-blue-100/50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg lg:rounded-2xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base">Encrypted Email</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600/20 border border-purple-500/40 text-purple-600 dark:text-purple-300 rounded-lg w-full sm:w-auto text-xs sm:text-sm font-medium">
                    <Lock className="w-4 h-4" />
                    <span>Decrypt Message</span>
                  </div>
                </div>

                {/* Check for encryption metadata */}
                {email.bodyContent.includes('--- ENCRYPTED METADATA ---') && (
                  <div className="mb-3">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Encryption Information:</h4>
                    <div className="bg-gray-200 dark:bg-gray-800 rounded p-2 sm:p-3 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-mono break-all overflow-hidden max-h-32 sm:max-h-48 overflow-y-auto">
                      {email.bodyContent.match(/--- ENCRYPTED METADATA ---\n([\s\S]*?)\n--- END METADATA ---/)?.[1] || 'Metadata not available'}
                    </div>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  This message is encrypted. Click "Decrypt Message" to view the content.
                </div>
              </div>
            )}

            {/* Show additional message info if available */}
            {email.payload && (
              <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg lg:rounded-2xl p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">Message Details</h4>
                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="break-all">Message ID: {email.id}</div>
                  {email.threadId && <div className="break-all">Thread ID: {email.threadId}</div>}
                  {email.labelIds && email.labelIds.length > 0 && (
                    <div className="break-words">Labels: {email.labelIds.join(', ')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;