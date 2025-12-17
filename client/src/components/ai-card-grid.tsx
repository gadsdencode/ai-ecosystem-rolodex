import { AiTool } from '@shared/schema';
import { AiCard } from './ai-card';
import { EmptyState } from './empty-state';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

interface AiCardGridProps {
  aiTools: AiTool[];
  filteredTools: AiTool[];
  activeCategory: string;
  searchQuery: string;
  onEdit: (tool: AiTool) => void;
  onDelete: (tool: AiTool) => void;
  onDetails: (tool: AiTool) => void;
  onAddNew: () => void;
  onChangeStatus?: (tool: AiTool, newStatus: 'production' | 'development') => void;
  showDevelopmentStatus?: boolean;
}

export function AiCardGrid({
  aiTools,
  filteredTools,
  activeCategory,
  searchQuery,
  onEdit,
  onDelete,
  onDetails,
  onAddNew,
  onChangeStatus,
  showDevelopmentStatus = false
}: AiCardGridProps) {
  const { theme } = useTheme();
  
  // Show empty state if there are no tools at all, or if filtering returns no results
  const showEmptyState = aiTools.length === 0;
  const showFilteredEmptyState = aiTools.length > 0 && filteredTools.length === 0;

  if (showEmptyState) {
    return <EmptyState onAddNew={onAddNew} />;
  }

  // Animation variants for the grid container
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  // Animation variants for the empty state
  const emptyStateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.3, 
        ease: "easeIn" 
      } 
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showFilteredEmptyState ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 px-4"
            key="empty-state"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={emptyStateVariants}
          >
            {/* Icon */}
            <div className={`p-5 rounded-2xl mb-6 ${
              theme === 'dark'
                ? 'bg-slate-800/50 border border-slate-700/50'
                : 'bg-slate-100/80 border border-slate-200/50'
            }`}>
              <Layers className={`w-12 h-12 ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`} />
            </div>
            
            {/* Title */}
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              No matching AI tools found
            </h3>
            
            {/* Description */}
            <p className={`text-center max-w-md mb-6 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {searchQuery 
                ? `No tools match the search "${searchQuery}"`
                : `No tools found in the "${activeCategory}" category`}
            </p>
            
            {/* Action Button */}
            <Button 
              variant="brand"
              onClick={() => window.dispatchEvent(new CustomEvent('setCategory', { detail: 'all' }))}
            >
              View all tools
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10"
            key="tools-grid"
            initial="hidden"
            animate="visible"
            variants={gridVariants}
            layout
          >
            <AnimatePresence>
              {filteredTools.map(tool => (
                <AiCard 
                  key={tool.id} 
                  tool={tool} 
                  onEdit={() => onEdit(tool)} 
                  onDelete={() => onDelete(tool)}
                  onClick={() => onDetails(tool)}
                  onChangeStatus={onChangeStatus ? 
                    (newStatus) => onChangeStatus(tool, newStatus) : 
                    undefined}
                  showDevelopmentStatus={showDevelopmentStatus}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
