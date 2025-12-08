import Link from "next/link";
import { Search, User, ArrowLeft, LogOut, ChevronDown, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
}

export default function TopHeader({ searchQuery, onSearchChange, onMenuClick }: TopHeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-1 sm:gap-2 lg:gap-4">
        {/* Left Side - Menu & Logo */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-0.5 sm:p-1"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          
          {/* Back Button - Hidden on mobile */}
          <Link href="/" className="hidden sm:block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            <Logo className="h-4 sm:h-6 lg:h-8 w-auto max-w-[120px] sm:max-w-none" />
            <div className="hidden xl:flex flex-col leading-tight">
              <span className="text-xs text-gray-500 dark:text-gray-400">Quantum Secure</span>
            </div>
          </div>
        </div>

        {/* Center - Search (Hidden on small mobile, shown on md+) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-2 lg:mx-4 xl:mx-8">
          <div className="relative w-full">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 lg:space-x-2">
          <div className="flex items-center space-x-0.5 sm:space-x-1 lg:space-x-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-0.5 sm:space-x-1 p-0.5 sm:p-1 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 sm:mt-2 w-48 sm:w-56 lg:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}