import { 
  Plus, 
  Inbox, 
  Send, 
  FileText, 
  Star, 
  Archive, 
  Trash2, 
  Settings 
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
  onComposeClick 
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
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full flex-shrink-0">
      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={onComposeClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Compose</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}