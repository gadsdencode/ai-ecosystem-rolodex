import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  openAddModal: () => void;
  showKeyboardShortcuts: () => void;
}

export function useKeyboardShortcuts({ 
  openAddModal,
  showKeyboardShortcuts
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Control + N to add new tool
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
      }
      
      // Command/Control + / to show keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        showKeyboardShortcuts();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openAddModal, showKeyboardShortcuts]);
}
