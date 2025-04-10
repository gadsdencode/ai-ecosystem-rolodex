import { AiTool } from '@shared/schema';
import { COLOR_GRADIENTS, CATEGORY_COLORS } from '../types';
import { getCategoryIcon } from '../lib/icons';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Server, Code, ChevronUp, ChevronDown } from 'lucide-react';
import { StatusToggle } from './status-toggle';

interface AiCardProps {
  tool: AiTool;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onChangeStatus?: (newStatus: 'production' | 'development') => void;
  showDevelopmentStatus?: boolean;
}

// Card animation variants
const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.5
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

export function AiCard({ 
  tool, 
  onEdit, 
  onDelete, 
  onClick, 
  onChangeStatus,
  showDevelopmentStatus = false 
}: AiCardProps) {
  const { from, to } = COLOR_GRADIENTS[tool.iconColor as keyof typeof COLOR_GRADIENTS] || COLOR_GRADIENTS.blue;
  const CategoryIcon = getCategoryIcon(tool.category);
  
  // Format date as "MMM d, yyyy" (e.g., "Apr 12, 2023")
  const formattedDate = format(new Date(tool.dateAdded), 'MMM d, yyyy');
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger card click if not clicking a button or link
    if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
      onClick();
    }
  };

  return (
    <motion.div 
      className="card group bg-glass rounded-xl overflow-hidden shadow-apple border border-white border-opacity-40 cursor-pointer relative"
      onClick={handleCardClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <div className="relative">
        <div className={`h-48 bg-gradient-to-br ${from} ${to} flex items-center justify-center`}>
          <CategoryIcon className="w-20 h-20 text-white" />
        </div>

        {/* Provider badge - shown in top left corner */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {tool.provider === 'overture' ? (
            <motion.div 
              className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full shadow-sm"
              whileHover={{ scale: 1.05 }}
            >
              Overture
            </motion.div>
          ) : (
            <motion.div 
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full shadow-sm"
              whileHover={{ scale: 1.05 }}
            >
              Third Party
            </motion.div>
          )}

          {/* Development Status Badge */}
          {showDevelopmentStatus && (
            <motion.div 
              className={`px-2 py-1 ${
                tool.developmentStatus === 'development' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-blue-100 text-blue-800'
              } text-xs font-medium rounded-full shadow-sm flex items-center`}
              whileHover={{ scale: 1.05 }}
            >
              {tool.developmentStatus === 'development' ? (
                <>
                  <Code className="w-3 h-3 mr-1" />
                  Dev
                </>
              ) : (
                <>
                  <Server className="w-3 h-3 mr-1" />
                  Prod
                </>
              )}
            </motion.div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex space-x-2">
          {/* Development Status Control */}
          {showDevelopmentStatus && onChangeStatus && (
            <>
              {tool.developmentStatus === 'development' ? (
                <motion.button 
                  className="p-1.5 rounded-full bg-white bg-opacity-80 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 backdrop-blur-sm" 
                  aria-label="Move to Production"
                  onClick={() => onChangeStatus('production')}
                  title="Move to Production"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button 
                  className="p-1.5 rounded-full bg-white bg-opacity-80 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200 backdrop-blur-sm" 
                  aria-label="Move to Development"
                  onClick={() => onChangeStatus('development')}
                  title="Move to Development"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </>
          )}

          <motion.button 
            className="p-1.5 rounded-full bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100 transition-all duration-200 backdrop-blur-sm" 
            aria-label="Edit"
            onClick={onEdit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </motion.button>
          
          <motion.button 
            className="p-1.5 rounded-full bg-white bg-opacity-80 text-gray-600 hover:bg-apple-red hover:text-white transition-all duration-200 backdrop-blur-sm" 
            aria-label="Delete"
            onClick={onDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{tool.name}</h3>
          <motion.span 
            className={`px-2 py-1 bg-${CATEGORY_COLORS[tool.category as keyof typeof CATEGORY_COLORS]}-100 text-${CATEGORY_COLORS[tool.category as keyof typeof CATEGORY_COLORS]}-800 rounded-md text-xs font-medium`}
            whileHover={{ scale: 1.05 }}
          >
            {tool.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </motion.span>
        </div>
        <p className="text-apple-gray text-sm mb-3">{tool.description}</p>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <motion.span 
                key={index} 
                className="px-2 py-0.5 bg-gray-100 text-apple-gray rounded-full text-xs font-medium"
                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              >
                {tag}
              </motion.span>
            ))}
            {tool.tags.length > 3 && (
              <motion.span 
                className="px-2 py-0.5 bg-gray-100 text-apple-gray rounded-full text-xs font-medium"
                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              >
                +{tool.tags.length - 3} more
              </motion.span>
            )}
          </div>
        </div>
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-apple-gray">Added: {formattedDate}</span>
          <motion.a 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-apple-blue text-sm font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Open Tool
          </motion.a>
        </div>
      </div>

      {/* Status Toggle for Admin Users */}
      {showDevelopmentStatus && onChangeStatus && (
        <StatusToggle 
          tool={tool} 
          onStatusChange={async (tool, newStatus) => {
            if (onChangeStatus) {
              onChangeStatus(newStatus);
            }
            // Return a resolved promise
            return Promise.resolve();
          }} 
        />
      )}
    </motion.div>
  );
}
