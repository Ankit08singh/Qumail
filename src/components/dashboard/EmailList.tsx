import { 
  Mail, 
  RefreshCw, 
  Filter, 
  Search, 
  Loader2, 
  CheckCircle,
  Shield,
  Star,
  Archive,
  Trash2,
  Undo
} from "lucide-react";

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

interface EmailListProps {
  activeView: string;
  messages: GmailMessage[];
  loading: boolean;
  searchQuery: string;
  selectedEmailId: string | null;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onEmailSelect: (email: GmailMessage) => void;
  onStarEmail: (emailId: string) => void;
  onArchiveEmail: (emailId: string) => void;
  onDeleteEmail: (emailId: string) => void;
  hasNewMessages?: boolean;
}

export default function EmailList({
  activeView,
  messages,
  loading,
  searchQuery,
  selectedEmailId,
  onSearchChange,
  onRefresh,
  onEmailSelect,
  onStarEmail,
  onArchiveEmail,
  onDeleteEmail,
  hasNewMessages
}: EmailListProps) {
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

  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (sender: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = (sender?.length || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-1 h-full">
      {/* Email List Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-700 dark:text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{activeView}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{messages.length} emails</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={onRefresh}
              className={`relative p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                hasNewMessages 
                  ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              title={hasNewMessages ? 'New messages available - Click to refresh' : 'Refresh emails'}
            >
              <RefreshCw className={`w-5 h-5 ${hasNewMessages ? 'animate-pulse' : ''}`} />
              {hasNewMessages && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter className="w-5 h-5" />
            </button>
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {messages.length}
            </div>
          </div>
        </div>

        {/* New Messages Notification */}
        {hasNewMessages && (
          <div className="mx-4 mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                New messages are available
              </span>
            </div>
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium underline hover:no-underline transition-all"
            >
              Refresh now
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p>No emails found</p>
              <button
                onClick={onRefresh}
                className="mt-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Refresh inbox
              </button>
            </div>
          </div>
        ) : (
          messages.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email)}
              className={`border-b border-gray-200 dark:border-gray-700 px-4 py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 group ${
                selectedEmailId === email.id ? 'bg-gray-100 dark:bg-gray-800 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="mt-2 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Avatar */}
                <div className={`w-10 h-10 ${getAvatarColor(email.sender || '')} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1`}>
                  {getInitials(email.sender || '')}
                </div>

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{email.sender}</span>
                      {email.isEncrypted && <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(email.internalDate || '')}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{email.displaySubject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {email.snippet || email.bodyContent?.substring(0, 100)}
                  </p>

                  {/* Status Indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {email.isEncrypted && (
                        <div className="flex items-center space-x-1 bg-green-100/50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded px-2 py-1">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Encrypted</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Star button - available in all views except trash */}
                      {activeView !== 'trash' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onStarEmail(email.id);
                          }}
                          className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
                            email.labelIds?.includes('STARRED') ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'
                          }`}
                          title={email.labelIds?.includes('STARRED') ? 'Remove star' : 'Add star'}
                        >
                          <Star className={`w-4 h-4 ${email.labelIds?.includes('STARRED') ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      
                      {/* Archive/Unarchive button */}
                      {activeView === 'archive' ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveEmail(email.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-500"
                          title="Unarchive"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                      ) : activeView !== 'trash' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveEmail(email.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Delete/Restore button */}
                      {activeView === 'trash' ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEmail(email.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-green-500"
                          title="Restore"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEmail(email.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}