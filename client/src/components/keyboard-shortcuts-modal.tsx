import { useEffect } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Register keyboard shortcut for Escape to close modal
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
    { action: 'Search', keys: ['⌘', 'K'] },
    { action: 'Add new tool', keys: ['⌘', 'N'] },
    { action: 'Show keyboard shortcuts', keys: ['⌘', '/'] },
    { action: 'Close modal', keys: ['Esc'] },
    { action: 'Filter by category', keys: ['⌘', '1-5'] },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="modal-content bg-glass-dark rounded-xl overflow-hidden shadow-lg max-w-md w-full mx-4 border border-white border-opacity-40 animate-in fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
            <button 
              className="text-apple-gray hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">{shortcut.action}</span>
                <div className="flex space-x-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd key={keyIndex} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
