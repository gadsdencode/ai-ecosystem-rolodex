import { useState, useEffect } from 'react';
import { AppHeader } from '../components/app-header';
import { CategoryFilters } from '../components/category-filters';
import { AiCardGrid } from '../components/ai-card-grid';
import { AddEditModal } from '../components/add-edit-modal';
import { DetailModal } from '../components/detail-modal';
import { ConfirmDeleteModal } from '../components/confirm-delete-modal';
import { KeyboardShortcutsModal } from '../components/keyboard-shortcuts-modal';
import { AiTool, AiToolFormData } from '@shared/schema';
import { useAiTools } from '../hooks/use-ai-tools';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { ALL_CATEGORIES } from '../types';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
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
    isAdding,
    isUpdating,
    isDeleting
  } = useAiTools();

  // Register global keyboard shortcuts
  useKeyboardShortcuts({
    openAddModal: () => handleOpenAddModal(),
    showKeyboardShortcuts: () => setShortcutsModalOpen(true),
  });

  // Filter tools by category and search query
  const filteredTools = aiTools.filter(tool => {
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
        tool.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (tool.notes && tool.notes.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

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

  return (
    <>
      <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <CategoryFilters 
          categories={ALL_CATEGORIES} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        {/* Dashboard Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">Your AI Tools</h2>
          <button 
            className="px-4 py-2 bg-apple-blue text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-opacity-50"
            onClick={handleOpenAddModal}
            disabled={isAdding}
          >
            <PlusCircle className="w-5 h-5 mr-1.5" />
            Add New Tool
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AiCardGrid 
            aiTools={aiTools}
            filteredTools={filteredTools}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onDetails={handleOpenDetailModal}
            onAddNew={handleOpenAddModal}
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
