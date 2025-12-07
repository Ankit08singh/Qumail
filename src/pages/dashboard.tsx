import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import EmailViewer from '@/components/EmailViewer';
import TopHeader from '@/components/dashboard/TopHeader';
import Sidebar from '@/components/dashboard/Sidebar';
import EmailList from '@/components/dashboard/EmailList';
import ComposeModal from '@/components/dashboard/ComposeModal';
import { useEmailOperations, EmailForm, GmailMessage } from '@/hooks/useEmailOperations';
import API from '@/utils/axios';

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hasLoadedInitialMessages = useRef(false);
  const activeViewRef = useRef(activeView);
  // Email form state
  const [emailForm, setEmailForm] = useState<EmailForm>({
    to: '',
    subject: '',
    body: '',
    isHtml: false,
    type: 'QKD'
  });

  // Use email operations hook
  const {
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
    smartRefresh,
    checkForNewMessages,
    hasNewMessages,
    lastCheckTime
  } = useEmailOperations();

  // Update activeView ref when it changes
  useEffect(() => {
    activeViewRef.current = activeView;
    console.log(`Dashboard: Tab switched to ${activeView} - no fetch triggered`);
  }, [activeView]);

  // Get user's email address from session
  const userEmail = session?.user?.email || '';

  // Helper function to extract email from sender string
  const extractEmail = (senderString: string) => {
    if (senderString?.includes('<') && senderString?.includes('>')) {
      return senderString.match(/<(.+)>/)?.[1] || senderString;
    }
    return senderString;
  };

  // Calculate counts for all tabs
  const getTabCounts = () => {
    const counts = {
      inbox: 0,
      sent: 0,
      starred: 0,
      archive: 0,
      trash: 0,
      drafts: 0
    };

    messages.forEach((message) => {
      const senderEmail = extractEmail(message.sender || '');
      const isDeleted = message.labelIds?.includes('TRASH') || message.labelIds?.includes('DELETED');
      const isArchived = message.labelIds?.includes('ARCHIVE') || message.labelIds?.includes('ARCHIVED');
      const isStarred = message.labelIds?.includes('STARRED');
      const isSent = senderEmail === userEmail;

      if (isDeleted) {
        counts.trash++;
      } else if (isArchived) {
        counts.archive++;
      } else if (isSent) {
        counts.sent++;
      } else {
        counts.inbox++;
      }

      if (isStarred && !isDeleted && !isArchived) {
        counts.starred++;
      }
    });

    return counts;
  };

  const tabCounts = getTabCounts();

  // Legacy variables for backward compatibility
  const inboxMessages = messages.filter((message) => {
    const senderEmail = extractEmail(message.sender || '');
    const isDeleted = message.labelIds?.includes('TRASH') || message.labelIds?.includes('DELETED');
    const isArchived = message.labelIds?.includes('ARCHIVE') || message.labelIds?.includes('ARCHIVED');
    return senderEmail !== userEmail && !isDeleted && !isArchived;
  });

  const sentMessages = messages.filter((message) => {
    const senderEmail = extractEmail(message.sender || '');
    const isDeleted = message.labelIds?.includes('TRASH') || message.labelIds?.includes('DELETED');
    const isArchived = message.labelIds?.includes('ARCHIVE') || message.labelIds?.includes('ARCHIVED');
    return senderEmail === userEmail && !isDeleted && !isArchived;
  });

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('User email:', userEmail);
    console.log('Total messages:', messages.length);
    console.log('Inbox messages:', inboxMessages.length);
    console.log('Sent messages:', sentMessages.length);
  }

  // Filter messages based on active view - each email can only be in one tab
  const filteredMessages = messages.filter((message) => {
    const senderEmail = extractEmail(message.sender || '');
    const isDeleted = message.labelIds?.includes('TRASH') || message.labelIds?.includes('DELETED');
    const isArchived = message.labelIds?.includes('ARCHIVE') || message.labelIds?.includes('ARCHIVED');
    const isStarred = message.labelIds?.includes('STARRED');
    const isSent = senderEmail === userEmail;

    // Don't show deleted emails in any tab except trash
    if (isDeleted && activeView !== 'trash') {
      return false;
    }

    // Don't show archived emails in any tab except archive
    if (isArchived && activeView !== 'archive') {
      return false;
    }

    switch (activeView) {
      case 'inbox':
        // Show unarchived, undeleted emails received by the user
        return !isSent && !isArchived && !isDeleted;
        
      case 'sent':
        // Show unarchived, undeleted emails sent by the user
        return isSent && !isArchived && !isDeleted;
        
      case 'starred':
        // Show starred emails that are not archived or deleted
        return isStarred && !isArchived && !isDeleted;
        
      case 'archive':
        // Show only archived emails
        return isArchived && !isDeleted;
        
      case 'trash':
        // Show only deleted emails
        return isDeleted;
        
      default:
        return true;
    }
  });

  // Handle email selection
  const handleEmailSelect = (email: GmailMessage) => {
    setSelectedEmailId(email.id);
    setSelectedEmail(email);
    if (email.isEncrypted) {
      decryptEmail(email);
    }
  };

  // Handle compose send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      const res = await API.post('/auth/send-encrypted-email', emailForm);
      console.log("Email sent successfully:", res);
      alert('Email sent successfully!');
      setEmailForm({ to: '', subject: '', body: '', isHtml: false, type: 'AES' });
      setShowCompose(false);
      setActiveView('inbox');
      // Refresh messages to show the sent email
      await fetchMessages();
    } catch (err: any) {
      console.log("Failed to send email:", err.message);
      alert('Failed to send email: ' + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // Only fetch messages on initial load, not when switching tabs
  useEffect(() => {
    if (session && !hasLoadedInitialMessages.current) {
      console.log('Dashboard: Initial message fetch triggered');
      fetchMessages();
      hasLoadedInitialMessages.current = true;
    }
  }, [session]);

  // Periodic check for new messages (every 30 seconds)
  useEffect(() => {
    if (!session) return;

    const checkInterval = setInterval(() => {
      // Only check for new messages when on inbox or sent tabs
      const currentView = activeViewRef.current;
      if (currentView === 'inbox' || currentView === 'sent') {
        checkForNewMessages();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [session, checkForNewMessages]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      {/* Top Header */}
      <TopHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView}
          setActiveView={setActiveView}
          inboxCount={tabCounts.inbox}
          sentCount={tabCounts.sent}
          starredCount={tabCounts.starred}
          archiveCount={tabCounts.archive}
          trashCount={tabCounts.trash}
          draftsCount={tabCounts.drafts}
          onComposeClick={() => setShowCompose(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Email List Area - Full width on mobile */}
        {!selectedEmail && (
          <EmailList 
            activeView={activeView}
            messages={filteredMessages}
            loading={loading}
            searchQuery={searchQuery}
            selectedEmailId={selectedEmailId}
            onSearchChange={setSearchQuery}
            onRefresh={smartRefresh}
            onEmailSelect={handleEmailSelect}
            onStarEmail={starEmail}
            onArchiveEmail={activeView === 'archive' ? unarchiveEmail : archiveEmail}
            onDeleteEmail={activeView === 'trash' ? restoreEmail : deleteEmail}
            hasNewMessages={hasNewMessages}
          />
        )}

        {/* Email Content Area - Full width on mobile */}
        {selectedEmail && (
          <div className="flex-1 bg-white dark:bg-gray-900 w-full">
            <EmailViewer 
              email={selectedEmail} 
              onBack={() => {
                setSelectedEmail(null);
                setSelectedEmailId(null);
              }}
              onStarEmail={starEmail}
              onArchiveEmail={activeView === 'archive' ? unarchiveEmail : archiveEmail}
              onDeleteEmail={activeView === 'trash' ? restoreEmail : deleteEmail}
              activeView={activeView}
            />
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <ComposeModal 
        isOpen={showCompose}
        emailForm={emailForm}
        loading={sendingEmail}
        onClose={() => setShowCompose(false)}
        onFormChange={setEmailForm}
        onSend={handleSend}
      />
    </div>
  );
}

// Protect the dashboard route
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};