import { useState, useEffect } from 'react';
import { Search, Sun, Moon, Settings, Sparkles } from 'lucide-react';
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
        sticky top-0 z-30 backdrop-blur-xl px-4 sm:px-6 md:px-8 transition-all duration-300
        ${theme === 'light' 
          ? 'bg-white/70 border-b border-border/50' 
          : 'bg-slate-900/70 border-b border-white/10'}
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
          {/* Logo with brand gradient */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg 
              className="h-10 w-10 text-primary-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                stroke="url(#logoGradient)"
                variants={pathVariants}
                initial="hidden"
                animate="visible"
              />
            </motion.svg>
            {/* Glow effect */}
            <div className="absolute inset-0 blur-lg opacity-30 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full -z-10" />
          </motion.div>
          
          <div className='flex flex-col ml-3'>
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              AI Rolodex
            </motion.h1>
            <motion.h2 
              className="text-sm font-medium text-muted-foreground flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
              <span className="font-mono tracking-tight">OVERTURE ECOSYSTEM</span>
            </motion.h2>
          </div>
        </motion.div>
        
        {/* Search Bar */}
        <motion.div 
          className="relative max-w-md w-full mx-4"
          variants={searchBarVariants}
          initial="initial"
          animate={isSearchActive ? "active" : "visible"}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <motion.div
              animate={{ 
                scale: isSearchActive ? 1.1 : 1,
                color: isSearchActive ? '#6366f1' : theme === 'light' ? '#6b7280' : '#9ca3af'
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
              pl-10 pr-12 py-2.5 w-full rounded-xl font-medium
              transition-all duration-300
              ${theme === 'light' 
                ? 'bg-white/80 border border-border/50 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20' 
                : 'bg-slate-800/80 border border-white/10 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 text-white placeholder-gray-400'}
              backdrop-blur-sm
            `}
            whileFocus={{ scale: 1.01 }}
          />
          <AnimatePresence>
            {showSearchShortcut && (
              <motion.div 
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md font-mono
                  ${theme === 'light' 
                    ? 'text-muted-foreground bg-muted/80 border border-border/50' 
                    : 'text-gray-400 bg-slate-700/80 border border-white/10'}
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
          className="flex items-center gap-2"
          variants={settingsVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Theme toggle button */}
          <motion.button
            onClick={toggleTheme}
            className={`
              rounded-xl p-2.5 transition-all duration-200
              ${theme === 'light' 
                ? 'text-amber-500 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                : 'text-primary-400 hover:bg-primary-500/10 hover:shadow-glow'}
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
              rounded-xl p-2.5 transition-all duration-200
              ${theme === 'light' 
                ? 'text-muted-foreground hover:bg-muted/80 hover:text-foreground' 
                : 'text-gray-400 hover:bg-slate-800/80 hover:text-white'}
            `}
            aria-label="Settings"
            onClick={handleToggleThemeMenu}
            variants={settingsVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          {/* Theme menu dropdown */}
          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                className={`
                  absolute top-16 right-4 p-4 rounded-xl shadow-brand-lg z-50 backdrop-blur-xl min-w-[200px]
                  ${theme === 'light' 
                    ? 'bg-white/95 border border-border/50' 
                    : 'bg-slate-900/95 border border-white/10'}
                `}
                variants={themeMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="font-semibold mb-2 flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-primary-400" />
                  )}
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Click the {theme === 'light' ? 'sun' : 'moon'} icon to toggle
                </div>
                <button
                  onClick={() => setShowThemeMenu(false)}
                  className={`
                    text-sm px-4 py-2 rounded-lg w-full font-medium transition-all
                    ${theme === 'light' 
                      ? 'bg-muted hover:bg-muted/80 text-foreground' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'}
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
