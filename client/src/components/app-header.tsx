import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  const [showSearchShortcut, setShowSearchShortcut] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setShowSearchShortcut(false);
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    setShowSearchShortcut(!searchQuery);
    setIsSearchActive(false);
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

  // Logo animation variants
  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.1
      } 
    }
  };

  // Path animation for the logo
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { 
        duration: 1.5, 
        ease: "easeInOut",
        delay: 0.2
      } 
    }
  };

  // Search bar animation variants
  const searchBarVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        delay: 0.3
      } 
    },
    active: {
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 20
      }
    }
  };

  // Settings button animation
  const settingsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15,
        delay: 0.4
      } 
    },
    hover: { 
      rotate: 90,
      scale: 1.1,
      transition: { type: "spring", stiffness: 300, damping: 10 }
    },
    tap: { scale: 0.9 }
  };

  // Shortcut animation
  const shortcutVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      scale: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.header 
      className="sticky top-0 z-30 bg-white bg-opacity-70 backdrop-blur-[10px] border-b border-gray-200 px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.svg 
            className="h-9 w-9 text-apple-blue" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.svg>
          <motion.h1 
            className="ml-3 text-2xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            AI Ecosystem Rolodex
          </motion.h1>
        </motion.div>
        
        {/* Search Bar */}
        <motion.div 
          className="relative max-w-md w-full"
          variants={searchBarVariants}
          initial="hidden"
          animate={isSearchActive ? "active" : "visible"}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <motion.div
              animate={{ 
                scale: isSearchActive ? 1.1 : 1,
                color: isSearchActive ? '#3b82f6' : '#6b7280'
              }}
            >
              <Search className="w-5 h-5" />
            </motion.div>
          </div>
          <motion.input 
            type="search" 
            id="search" 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search AI tools..." 
            className="pl-10 pr-10 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-apple-blue focus:border-apple-blue bg-white bg-opacity-80 backdrop-blur-sm"
            whileFocus={{ scale: 1.02 }}
          />
          <AnimatePresence>
            {showSearchShortcut && (
              <motion.div 
                className="absolute right-2.5 top-2.5 text-xs text-apple-gray bg-gray-50 px-1.5 py-0.5 rounded-md"
                variants={shortcutVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                ⌘K
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Settings */}
        <motion.div 
          className="flex items-center"
          variants={settingsVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button 
            className="ml-4 rounded-full p-1.5 text-apple-gray hover:bg-gray-200 transition-colors duration-200" 
            aria-label="Settings"
            variants={settingsVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
}
