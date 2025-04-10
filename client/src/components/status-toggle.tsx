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
        <div className="p-2 bg-white bg-opacity-90 rounded-lg shadow-md flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
        </div>
      ) : isHovered ? (
        <motion.div 
          className="bg-white bg-opacity-90 rounded-lg shadow-md p-1 flex"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {tool.developmentStatus === 'development' ? (
            <motion.button
              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded"
              onClick={() => handleStatusChange('production')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Move to Production"
            >
              <ChevronUp className="w-3 h-3" />
              <span>To Production</span>
            </motion.button>
          ) : (
            <motion.button
              className="flex items-center space-x-1 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50 rounded"
              onClick={() => handleStatusChange('development')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Move to Development"
            >
              <ChevronDown className="w-3 h-3" />
              <span>To Development</span>
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          className={`p-1.5 rounded-full ${
            tool.developmentStatus === 'development' 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-blue-100 text-blue-800'
          } opacity-70 hover:opacity-100 transition-opacity`}
          whileHover={{ scale: 1.1 }}
        >
          {tool.developmentStatus === 'development' ? (
            <Code className="w-3.5 h-3.5" />
          ) : (
            <Server className="w-3.5 h-3.5" />
          )}
        </motion.div>
      )}
    </div>
  );
} 