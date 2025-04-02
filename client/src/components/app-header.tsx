import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  const [showSearchShortcut, setShowSearchShortcut] = useState(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setShowSearchShortcut(false);
  };

  const handleSearchBlur = () => {
    setShowSearchShortcut(!searchQuery);
  };

  // Register keyboard shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white bg-opacity-70 backdrop-blur-[10px] border-b border-gray-200 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-9 w-9 text-apple-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h1 className="ml-3 text-2xl font-medium">AI Ecosystem Rolodex</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-apple-gray" />
          </div>
          <input 
            type="search" 
            id="search" 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search AI tools..." 
            className="pl-10 pr-10 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-apple-blue focus:border-apple-blue bg-white bg-opacity-80 backdrop-blur-sm transition-all duration-200"
          />
          {showSearchShortcut && (
            <div className="absolute right-2.5 top-2.5 text-xs text-apple-gray">⌘K</div>
          )}
        </div>
        
        {/* Settings */}
        <div className="flex items-center">
          <button 
            className="ml-4 rounded-full p-1.5 text-apple-gray hover:bg-gray-200 transition-colors duration-200" 
            aria-label="Settings"
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
