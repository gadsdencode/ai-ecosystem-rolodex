import { useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  toolName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ isOpen, toolName, onClose, onConfirm }: ConfirmDeleteModalProps) {
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
              {/* Warning Icon */}
              <motion.div 
                className="flex justify-center mb-5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 border border-accent-500/30">
                    <AlertTriangle className="w-10 h-10 text-accent-500" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-accent-500/20 blur-xl -z-10" />
                </div>
              </motion.div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-center text-foreground mb-2">
                Confirm Deletion
              </h2>
              
              {/* Description */}
              <p className="text-center text-muted-foreground mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">{toolName}</span>?
                <br />
                <span className="text-sm">This action cannot be undone.</span>
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  variant="glow-rose"
                  className="flex-1"
                  onClick={onConfirm}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
