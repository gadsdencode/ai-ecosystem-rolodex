import { useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { action: 'Search', keys: ['⌘', 'K'], description: 'Focus search input' },
    { action: 'Add new tool', keys: ['⌘', 'N'], description: 'Open add tool modal' },
    { action: 'Keyboard shortcuts', keys: ['⌘', '/'], description: 'Show this dialog' },
    { action: 'Close modal', keys: ['Esc'], description: 'Close any open modal' },
    { action: 'Filter by category', keys: ['⌘', '1-9'], description: 'Quick category filter' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className={`relative rounded-2xl overflow-hidden shadow-brand-xl max-w-md w-full mx-4 ${
              theme === 'light'
                ? 'bg-white/95 border border-white/50'
                : 'bg-slate-900/95 border border-white/10'
            } backdrop-blur-xl`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-brand">
                    <Keyboard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Keyboard Shortcuts</h2>
                </div>
                <button 
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Shortcuts List */}
              <div className="space-y-1">
                {shortcuts.map((shortcut, index) => (
                  <motion.div 
                    key={index} 
                    className={`flex justify-between items-center py-3 px-3 rounded-lg transition-colors ${
                      theme === 'light'
                        ? 'hover:bg-muted/50'
                        : 'hover:bg-muted/30'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div>
                      <span className="font-medium text-foreground">{shortcut.action}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{shortcut.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd 
                          key={keyIndex} 
                          className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-md font-mono text-xs font-medium ${
                            theme === 'light'
                              ? 'bg-muted border border-border/50 text-foreground shadow-sm'
                              : 'bg-slate-800 border border-white/10 text-white shadow-sm'
                          }`}
                        >
                          {key === '⌘' ? <Command className="w-3 h-3" /> : key}
                        </kbd>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Footer tip */}
              <div className={`mt-6 p-3 rounded-lg text-sm ${
                theme === 'light'
                  ? 'bg-primary-50 text-primary-700 border border-primary-100'
                  : 'bg-primary-950/50 text-primary-300 border border-primary-800/30'
              }`}>
                <p className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-primary-500/20 px-1.5 py-0.5 rounded">TIP</span>
                  Press <kbd className="font-mono text-xs bg-background/50 px-1 py-0.5 rounded border border-border/50">⌘ /</kbd> anytime to open shortcuts
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
