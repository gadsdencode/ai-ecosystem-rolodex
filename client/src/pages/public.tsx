import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { AppHeader } from '../components/app-header';
import { CategoryFilters } from '../components/category-filters';
import { DetailModal } from '../components/detail-modal';
import { KeyboardShortcutsModal } from '../components/keyboard-shortcuts-modal';
import { AiTool } from '@shared/schema';
import { useAiTools } from '../hooks/use-ai-tools';
import { ALL_CATEGORIES, COLOR_GRADIENTS } from '../types';
import { UserCircle, ExternalLink, Code, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/empty-state';
import { useTheme } from '../contexts/ThemeContext';
import { getCategoryIcon } from '../lib/icons';
import { Button } from '@/components/ui/button';

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
    // Filter by provider if selected
    if (activeCategory === 'overture' && tool.provider !== 'overture') {
      return false;
    }
    if (activeCategory === 'third-party' && tool.provider !== 'third-party') {
      return false;
    }
    
    // Filter by category
    if (activeCategory !== 'all' && activeCategory !== 'overture' && activeCategory !== 'third-party' && tool.category !== activeCategory) {
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
  })
  // Sort to prioritize Kainbridge (first-party) apps first
  .sort((a, b) => {
    // First sort by provider (overture first)
    if (a.provider === 'overture' && b.provider !== 'overture') return -1;
    if (a.provider !== 'overture' && b.provider === 'overture') return 1;
    
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">AI Tool Directory</h2>
          <Link href="/login">
            <Button variant="brand-outline" size="default" className="flex items-center gap-1.5">
              <UserCircle className="w-5 h-5" />
              Admin Login
            </Button>
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No tools found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                No AI tools match your current filters. Try adjusting your search or category selection.
              </p>
              <motion.button 
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg flex items-center mx-auto hover:shadow-brand-lg transition-all duration-200"
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Animation variants for card
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      } 
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  // Check if the tool is in development
  const isInDevelopment = tool.developmentStatus === 'development';
  
  // Get gradient colors for the header
  const { from, to } = COLOR_GRADIENTS[tool.iconColor as keyof typeof COLOR_GRADIENTS] || COLOR_GRADIENTS.blue;
  const CategoryIcon = getCategoryIcon(tool.category);

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-xl backdrop-blur-lg cursor-pointer transition-all duration-300 ${
        isDark
          ? 'bg-slate-900/80 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]'
          : 'bg-white/80 border border-white/50 shadow-lg hover:shadow-brand-lg'
      }`}
      variants={cardVariants}
      layoutId={`card-${tool.id}`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Gradient header with category icon */}
      <div className="relative">
        <div className={`h-36 bg-gradient-to-br ${from} ${to} flex items-center justify-center relative overflow-hidden`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />
          
          <CategoryIcon className="w-16 h-16 text-white drop-shadow-lg relative z-10" />
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
        </div>

        {/* Provider & Status badges - top left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {tool.provider === 'overture' ? (
            <motion.div 
              className="px-2.5 py-1 bg-gradient-to-r from-primary-500/90 to-secondary-500/90 text-white text-xs font-semibold rounded-full shadow-md backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-mono tracking-tight">OVERTURE</span>
            </motion.div>
          ) : (
            <motion.div 
              className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-md backdrop-blur-sm border ${
                isDark
                  ? 'bg-slate-800/90 text-slate-300 border-white/10'
                  : 'bg-white/90 text-slate-600 border-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              Third Party
            </motion.div>
          )}

          {/* Development Status Badge */}
          {isInDevelopment && (
            <motion.div 
              className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm flex items-center gap-1 bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white"
              whileHover={{ scale: 1.05 }}
            >
              <Code className="w-3 h-3" />
              <span className="font-mono">DEV</span>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-5">
        <h3 className={`font-semibold text-lg line-clamp-1 mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {tool.name}
        </h3>
        
        <p className={`text-sm line-clamp-2 mb-4 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {tool.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tool.tags.slice(0, 3).map((tag: string, index: number) => (
            <motion.span 
              key={index} 
              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                isDark
                  ? 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                  : 'bg-slate-100/80 text-slate-600 border-slate-200/50'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {tag}
            </motion.span>
          ))}
          {tool.tags.length > 3 && (
            <motion.span 
              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                isDark
                  ? 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                  : 'bg-slate-100/80 text-slate-600 border-slate-200/50'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              +{tool.tags.length - 3}
            </motion.span>
          )}
        </div>

        {/* Footer link */}
        <div className={`pt-3 border-t flex justify-end items-center ${
          isDark ? 'border-slate-700/50' : 'border-slate-200/50'
        }`}>
          <motion.a 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isDark
                ? 'text-primary-400 hover:text-primary-300'
                : 'text-primary-500 hover:text-primary-600'
            }`}
            onClick={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Open Tool
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>
      
      {/* Development Banner - only for development status */}
      {isInDevelopment && (
        <div className="absolute top-2 -right-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-0.5 text-xs font-bold transform rotate-45 shadow-md">
          Beta
        </div>
      )}

      {/* Subtle gradient border on hover */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border ${
        isDark ? 'border-primary-500/30' : 'border-primary-500/20'
      }`} />
    </motion.div>
  );
}