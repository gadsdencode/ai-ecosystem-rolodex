import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { AppHeader } from '../components/app-header';
import { CategoryFilters } from '../components/category-filters';
import { DetailModal } from '../components/detail-modal';
import { KeyboardShortcutsModal } from '../components/keyboard-shortcuts-modal';
import { AiTool } from '@shared/schema';
import { useAiTools } from '../hooks/use-ai-tools';
import { ALL_CATEGORIES } from '../types';
import { UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/empty-state';

export default function Public() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  
  const [currentTool, setCurrentTool] = useState<AiTool | null>(null);
  
  const { 
    aiTools, 
    isLoading, 
    error
  } = useAiTools();

  // Filter tools by category and search query
  const filteredTools = aiTools.filter((tool: AiTool) => {
    // Filter by category
    if (activeCategory !== 'all' && tool.category !== activeCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some((tag: string) => tag.toLowerCase().includes(query)) ||
        (tool.notes && tool.notes.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const handleOpenDetailModal = (tool: AiTool) => {
    setCurrentTool(tool);
    setDetailModalOpen(true);
  };

  // Listen for the custom "setCategory" event
  useEffect(() => {
    const handleSetCategory = (e: CustomEvent) => {
      setActiveCategory(e.detail);
    };
    
    // Add event listener
    window.addEventListener('setCategory', handleSetCategory as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('setCategory', handleSetCategory as EventListener);
    };
  }, []);

  // Show error toast if API error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "An error occurred",
        description: "Failed to load AI tools. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <>
      <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <CategoryFilters 
          categories={ALL_CATEGORIES} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        {/* Header with Login Link */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-400">AI Tool Directory</h2>
          <Link href="/login">
            <button className="px-4 py-2 text-apple-blue border border-apple-blue rounded-lg flex items-center hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-opacity-50">
              <UserCircle className="w-5 h-5 mr-1.5" />
              Admin Login
            </button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <PublicAiCardGrid 
            aiTools={aiTools as AiTool[]}
            filteredTools={filteredTools as AiTool[]}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onDetails={handleOpenDetailModal}
          />
        )}
      </main>

      {/* Modals */}
      <DetailModal 
        isOpen={detailModalOpen}
        tool={currentTool}
        onClose={() => setDetailModalOpen(false)}
        onEdit={() => {}} // No-op since editing is not allowed
        onDelete={() => {}} // No-op since deleting is not allowed
        readOnly={true} // Add this prop to hide edit/delete buttons
      />
      
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </>
  );
}

// Modified version of AiCardGrid for the public view
interface PublicAiCardGridProps {
  aiTools: AiTool[];
  filteredTools: AiTool[];
  activeCategory: string;
  searchQuery: string;
  onDetails: (tool: AiTool) => void;
}

function PublicAiCardGrid({
  aiTools,
  filteredTools,
  activeCategory,
  searchQuery,
  onDetails
}: PublicAiCardGridProps) {
  // Show empty state if there are no tools at all, or if filtering returns no results
  const showEmptyState = aiTools.length === 0;
  const showFilteredEmptyState = aiTools.length > 0 && filteredTools.length === 0;

  if (showEmptyState) {
    return <EmptyState onAddNew={() => {}} />;
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
            className="flex flex-col items-center justify-center py-10"
            key="empty-state"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={emptyStateVariants}
          >
            <motion.div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-500 mb-6">
                No AI tools match your current filters. Try adjusting your search or category selection.
              </p>
              <motion.button 
                className="px-5 py-2.5 bg-apple-blue text-white rounded-lg flex items-center mx-auto hover:bg-blue-600 transition-colors duration-200"
                onClick={() => window.dispatchEvent(new CustomEvent('setCategory', { detail: 'all' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View all tools
              </motion.button>
            </motion.div>
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
                <PublicAiCard 
                  key={tool.id} 
                  tool={tool} 
                  onClick={() => onDetails(tool)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Modified version of AiCard for the public view (without edit/delete buttons)
interface PublicAiCardProps {
  tool: AiTool;
  onClick: () => void;
}

function PublicAiCard({ tool, onClick }: PublicAiCardProps) {
  // Animation variants for card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
      variants={cardVariants}
      layoutId={`card-${tool.id}`}
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="p-5 cursor-pointer">
        <div className="flex justify-between">
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-tr from-${tool.iconColor}-500 to-${tool.iconColor}-400`}
          >
            <span className="text-white text-xl font-bold">
              {tool.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <h3 className="mt-3 font-medium text-gray-900 text-lg line-clamp-1">{tool.name}</h3>
        
        <p className="mt-2 text-gray-600 text-sm line-clamp-3">{tool.description}</p>
        
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag: string, index: number) => (
            <span 
              key={index} 
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}