import { AiTool } from '@shared/schema';
import { AiCard } from './ai-card';
import { EmptyState } from './empty-state';
import { motion, AnimatePresence } from 'framer-motion';

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
            <svg className="w-20 h-20 text-apple-gray mb-4 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No matching AI tools found</h3>
            <p className="text-apple-gray text-center max-w-md mb-6">
              {searchQuery 
                ? `No tools match the search "${searchQuery}"`
                : `No tools found in the "${activeCategory}" category`}
            </p>
            <motion.button 
              className="px-5 py-2.5 bg-apple-blue text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-200"
              onClick={() => window.dispatchEvent(new CustomEvent('setCategory', { detail: 'all' }))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View all tools
            </motion.button>
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
