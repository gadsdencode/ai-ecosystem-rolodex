import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { AppHeader } from '../components/app-header';
import { CategoryFilters } from '../components/category-filters';
import { AiCardGrid } from '../components/ai-card-grid';
import { AddEditModal } from '../components/add-edit-modal';
import { DetailModal } from '../components/detail-modal';
import { ConfirmDeleteModal } from '../components/confirm-delete-modal';
import { KeyboardShortcutsModal } from '../components/keyboard-shortcuts-modal';
import { AiTool, AiToolFormData, CategoryType, ProviderType, ColorType, DevelopmentStatusType } from '@shared/schema';
import { useAiTools } from '../hooks/use-ai-tools';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { ALL_CATEGORIES } from '../types';
import { PlusCircle, LogOut, Server, Code, Layers, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const { theme } = useTheme();
  
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentTool, setCurrentTool] = useState<AiTool | null>(null);
  
  const { 
    aiTools, 
    isLoading, 
    error, 
    addAiTool, 
    updateAiTool, 
    deleteAiTool,
    updateToolStatus,
    isAdding,
    isUpdating,
    isDeleting,
    isUpdatingStatus
  } = useAiTools();

  // Register global keyboard shortcuts
  useKeyboardShortcuts({
    openAddModal: () => handleOpenAddModal(),
    showKeyboardShortcuts: () => setShortcutsModalOpen(true),
  });

  // Filter tools by category, development status, and search query
  const filteredTools = aiTools.filter((tool: AiTool) => {
    if (activeStatus !== 'all' && tool.developmentStatus !== activeStatus) {
      return false;
    }
    
    if (activeCategory === 'overture' && tool.provider !== 'overture') {
      return false;
    }
    if (activeCategory === 'third-party' && tool.provider !== 'third-party') {
      return false;
    }
    
    if (activeCategory !== 'all' && activeCategory !== 'overture' && activeCategory !== 'third-party' && tool.category !== activeCategory) {
      return false;
    }
    
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
  .sort((a, b) => {
    if (a.provider === 'overture' && b.provider !== 'overture') return -1;
    if (a.provider !== 'overture' && b.provider === 'overture') return 1;
    return a.name.localeCompare(b.name);
  });

  // Status counts
  const productionCount = aiTools.filter(tool => tool.developmentStatus === 'production').length;
  const developmentCount = aiTools.filter(tool => tool.developmentStatus === 'development').length;

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentTool(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (tool: AiTool) => {
    setModalMode('edit');
    setCurrentTool(tool);
    setDetailModalOpen(false);
    setAddEditModalOpen(true);
  };

  const handleOpenDetailModal = (tool: AiTool) => {
    setCurrentTool(tool);
    setDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (tool: AiTool) => {
    setCurrentTool(tool);
    setDetailModalOpen(false);
    setConfirmDeleteModalOpen(true);
  };

  const handleAddEditSubmit = async (data: AiToolFormData) => {
    try {
      console.log(`Submitting form data (${modalMode}):`, data);
      
      if (modalMode === 'add') {
        await addAiTool(data);
        toast({
          title: "Tool Added",
          description: `${data.name} has been added to your collection.`,
        });
      } else if (modalMode === 'edit' && currentTool) {
        await updateAiTool(currentTool.id, data);
        toast({
          title: "Tool Updated",
          description: `${data.name} has been updated successfully.`,
        });
      }
      setAddEditModalOpen(false);
    } catch (err) {
      console.error('Form submission error:', err);
      toast({
        title: "An error occurred",
        description: `Failed to ${modalMode === 'add' ? 'add' : 'update'} the tool. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentTool) return;
    
    try {
      await deleteAiTool(currentTool.id);
      toast({
        title: "Tool Deleted",
        description: `${currentTool.name} has been removed from your collection.`,
      });
      setConfirmDeleteModalOpen(false);
    } catch (err) {
      toast({
        title: "An error occurred",
        description: "Failed to delete the tool. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Logout handler
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    setLocation('/');
  };

  // Listen for the custom "setCategory" event
  useEffect(() => {
    const handleSetCategory = (e: CustomEvent) => {
      setActiveCategory(e.detail);
    };
    
    window.addEventListener('setCategory', handleSetCategory as EventListener);
    
    return () => {
      window.removeEventListener('setCategory', handleSetCategory as EventListener);
    };
  }, []);

  // Show error toast if API error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "An error occurred",
        description: "Failed to load your AI tools. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleChangeStatus = async (tool: AiTool, newStatus: 'production' | 'development') => {
    try {
      await updateToolStatus({ id: tool.id, status: newStatus });
      
      toast({
        title: "Status Updated",
        description: `${tool.name} has been moved to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        title: "An error occurred",
        description: "Failed to update tool status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Status tab data
  const statusTabs = [
    { id: 'all', label: 'All Tools', count: aiTools.length, icon: Layers },
    { id: 'production', label: 'Production', count: productionCount, icon: Server },
    { id: 'development', label: 'In Development', count: developmentCount, icon: Code },
  ];

  return (
    <>
      <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <CategoryFilters 
          categories={ALL_CATEGORIES} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        {/* Development Status Tabs */}
        <div className={`flex gap-1 mb-6 p-1 rounded-xl ${
          theme === 'light' ? 'bg-muted/50' : 'bg-muted/30'
        }`}>
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStatus === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-brand'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
                onClick={() => setActiveStatus(tab.id)}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <Badge 
                  variant={isActive ? "glass" : "outline"} 
                  className={`ml-1 ${isActive ? 'bg-white/20 text-white border-white/30' : ''}`}
                >
                  {tab.count}
                </Badge>
              </motion.button>
            );
          })}
        </div>

        {/* Dashboard Header with Add Button and Logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              Admin Dashboard
            </h2>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600 hover:bg-primary-500/10">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                View Public Site
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="brand"
              onClick={handleOpenAddModal}
              disabled={isAdding}
            >
              <PlusCircle className="w-5 h-5 mr-1.5" />
              Add New Tool
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="border-border/50 hover:border-accent-500/50 hover:text-accent-500"
            >
              <LogOut className="w-5 h-5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-secondary-500/20 border-b-secondary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-muted-foreground font-medium">Loading your AI tools...</p>
          </div>
        ) : (
          <AiCardGrid 
            aiTools={aiTools as AiTool[]}
            filteredTools={filteredTools as AiTool[]}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onDetails={handleOpenDetailModal}
            onAddNew={handleOpenAddModal}
            onChangeStatus={handleChangeStatus}
            showDevelopmentStatus={true}
          />
        )}
      </main>

      {/* Modals */}
      <AddEditModal 
        isOpen={addEditModalOpen}
        mode={modalMode}
        currentTool={currentTool}
        onClose={() => setAddEditModalOpen(false)}
        onSubmit={handleAddEditSubmit}
      />

      <DetailModal 
        isOpen={detailModalOpen}
        tool={currentTool}
        onClose={() => setDetailModalOpen(false)}
        onEdit={() => handleOpenEditModal(currentTool!)}
        onDelete={() => handleOpenDeleteModal(currentTool!)}
        onChangeStatus={handleChangeStatus}
      />

      <ConfirmDeleteModal 
        isOpen={confirmDeleteModalOpen}
        toolName={currentTool?.name || 'this AI tool'}
        onClose={() => setConfirmDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <KeyboardShortcutsModal 
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </>
  );
}
