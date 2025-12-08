import { 
  Plus, 
  Inbox, 
  Send, 
  FileText, 
  Star, 
  Archive, 
  Trash2, 
  Settings,
  X
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  inboxCount: number;
  sentCount: number;
  starredCount: number;
  archiveCount: number;
  trashCount: number;
  draftsCount: number;
  onComposeClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  inboxCount,
  sentCount,
  starredCount,
  archiveCount,
  trashCount,
  draftsCount,
  onComposeClick,
  isOpen = true,
  onClose
}: SidebarProps) {
  const navigationItems = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', count: inboxCount },
    { id: 'sent', icon: Send, label: 'Sent', count: sentCount },
    { id: 'drafts', icon: FileText, label: 'Drafts', count: draftsCount },
    { id: 'starred', icon: Star, label: 'Starred', count: starredCount },
    { id: 'archive', icon: Archive, label: 'Archive', count: archiveCount },
    { id: 'trash', icon: Trash2, label: 'Trash', count: trashCount },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        w-64 sm:w-72 lg:w-80
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700 
        flex flex-col h-full 
        z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex-shrink-0
      `}>
      {/* Mobile Close Button */}
      {onClose && (
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Compose Button */}
      <div className="p-3 sm:p-4">
        <button
          onClick={() => {
            onComposeClick();
            onClose?.();
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Compose</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 sm:px-4 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mb-2 transition-all duration-200 text-sm sm:text-base ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count > 0 && (
                <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-blue-500' : 'bg-blue-600 text-white'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm sm:text-base">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
    </>
  );
}