import { useState, useEffect } from 'react';
import { Search, Sun, Moon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showSearchShortcut, setShowSearchShortcut] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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
  
  const handleToggleThemeMenu = () => {
    setShowThemeMenu(!showThemeMenu);
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
    initial: { opacity: 0.9, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        duration: 0.3
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

  // Theme toggle menu animation
  const themeMenuVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { type: "spring", duration: 0.3, bounce: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.header 
      className={`
        sticky top-0 z-30 backdrop-blur-[10px] px-4 sm:px-6 md:px-8 transition-colors duration-300
        ${theme === 'light' 
          ? 'bg-white bg-opacity-70 border-b border-gray-200' 
          : 'bg-gray-900 bg-opacity-70 border-b border-gray-800'}
      `}
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
          <div className='flex flex-col'>
          <motion.h1 
            className="ml-3 text-2xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            AI Rolodex
          </motion.h1>
          <motion.h2 
            className={`ml-3 text-xl font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Kainbridge Ecosystem
          </motion.h2>
            </div>
        </motion.div>
        
        {/* Search Bar */}
        <motion.div 
          className="relative max-w-md w-full"
          variants={searchBarVariants}
          initial="initial"
          animate={isSearchActive ? "active" : "visible"}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <motion.div
              animate={{ 
                scale: isSearchActive ? 1.1 : 1,
                color: isSearchActive ? theme === 'light' ? '#3b82f6' : '#60a5fa' : theme === 'light' ? '#6b7280' : '#9ca3af'
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
            className={`
              pl-10 pr-10 py-2.5 w-full rounded-lg 
              focus:ring-apple-blue focus:border-apple-blue 
              transition-colors duration-300
              ${theme === 'light' 
                ? 'border border-gray-300 bg-white bg-opacity-80 backdrop-blur-sm' 
                : 'border border-gray-700 bg-gray-800 bg-opacity-70 text-white placeholder-gray-400'}
            `}
            whileFocus={{ scale: 1.02 }}
          />
          <AnimatePresence>
            {showSearchShortcut && (
              <motion.div 
                className={`
                  absolute right-2.5 top-2.5 text-xs px-1.5 py-0.5 rounded-md
                  ${theme === 'light' 
                    ? 'text-apple-gray bg-gray-50' 
                    : 'text-gray-400 bg-gray-700'}
                `}
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
        
        {/* Theme Toggle and Settings */}
        <motion.div 
          className="flex items-center space-x-2"
          variants={settingsVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Theme toggle button */}
          <motion.button
            onClick={toggleTheme}
            className={`
              rounded-full p-1.5 transition-colors duration-200
              ${theme === 'light' 
                ? 'text-yellow-500 hover:bg-yellow-100' 
                : 'text-blue-400 hover:bg-gray-800'}
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>
          
          {/* Settings button */}
          <motion.button 
            className={`
              ml-2 rounded-full p-1.5 transition-colors duration-200
              ${theme === 'light' 
                ? 'text-apple-gray hover:bg-gray-200' 
                : 'text-gray-400 hover:bg-gray-800'}
            `}
            aria-label="Settings"
            onClick={handleToggleThemeMenu}
            variants={settingsVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          {/* Theme menu dropdown (can be expanded later) */}
          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                className={`
                  absolute top-16 right-4 p-4 rounded-lg shadow-lg z-50
                  ${theme === 'light' 
                    ? 'bg-white border border-gray-200' 
                    : 'bg-gray-800 border border-gray-700'}
                `}
                variants={themeMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="font-medium mb-2">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'} Active
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  Click the {theme === 'light' ? 'sun' : 'moon'} icon to toggle theme
                </div>
                <button
                  onClick={() => setShowThemeMenu(false)}
                  className={`
                    text-sm px-3 py-1 rounded
                    ${theme === 'light' 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
                  `}
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.header>
  );
}
