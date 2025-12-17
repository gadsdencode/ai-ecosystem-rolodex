import { useState } from 'react';
import { AiTool } from '@shared/schema';
import { Server, Code, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusToggleProps {
  tool: AiTool;
  onStatusChange: (tool: AiTool, newStatus: 'production' | 'development') => Promise<void>;
}

export function StatusToggle({ tool, onStatusChange }: StatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleStatusChange = async (newStatus: 'production' | 'development') => {
    if (isUpdating || tool.developmentStatus === newStatus) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(tool, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Don't render anything for the public view or if the tool doesn't have development status yet
  if (!tool.developmentStatus) return null;
  
  return (
    <div 
      className="absolute right-3 bottom-3 z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isUpdating ? (
        <div className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
        </div>
      ) : isHovered ? (
        <motion.div 
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-brand p-1.5 flex"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {tool.developmentStatus === 'development' ? (
            <motion.button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
              onClick={() => handleStatusChange('production')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Move to Production"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span className="font-mono tracking-tight">PROD</span>
            </motion.button>
          ) : (
            <motion.button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
              onClick={() => handleStatusChange('development')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Move to Development"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span className="font-mono tracking-tight">DEV</span>
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          className={`p-2 rounded-lg shadow-md backdrop-blur-sm transition-all ${
            tool.developmentStatus === 'development' 
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
              : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
          } opacity-70 hover:opacity-100`}
          whileHover={{ scale: 1.1 }}
        >
          {tool.developmentStatus === 'development' ? (
            <Code className="w-4 h-4" />
          ) : (
            <Server className="w-4 h-4" />
          )}
        </motion.div>
      )}
    </div>
  );
}
