import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  toolName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ isOpen, toolName, onClose, onConfirm }: ConfirmDeleteModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="modal-content bg-glass-dark rounded-xl overflow-hidden shadow-lg max-w-md w-full mx-4 border border-white border-opacity-40 animate-in fade-in">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4 text-apple-red">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">Confirm Deletion</h2>
          <p className="text-center text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-medium">{toolName}</span>? This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <button 
              type="button" 
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="flex-1 px-4 py-2.5 bg-apple-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
