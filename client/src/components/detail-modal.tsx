import { useEffect, useState } from 'react';
import { AiTool } from '@shared/schema';
import { COLOR_GRADIENTS } from '../types';
import { getCategoryIcon } from '../lib/icons';
import { format } from 'date-fns';
import { ExternalLink, Edit, Trash2, X, Sparkles, Loader2 } from 'lucide-react';
import { generateToolSuggestions } from '../lib/xai';

interface DetailModalProps {
  isOpen: boolean;
  tool: AiTool | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function DetailModal({ isOpen, tool, onClose, onEdit, onDelete, readOnly = false }: DetailModalProps) {
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Fetch AI-powered tool suggestions when modal opens
  useEffect(() => {
    if (isOpen && tool && !aiSuggestions) {
      fetchSuggestions();
    }
    // Reset state when modal closes
    if (!isOpen) {
      setAiSuggestions(null);
    }
  }, [isOpen, tool]);

  const fetchSuggestions = async () => {
    if (!tool) return;
    
    setIsFetchingSuggestions(true);
    try {
      const suggestions = await generateToolSuggestions(tool.name, tool.description);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Register keyboard shortcut for Escape to close modal
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

  const { from, to } = COLOR_GRADIENTS[tool.iconColor as keyof typeof COLOR_GRADIENTS] || COLOR_GRADIENTS.blue;
  const CategoryIcon = getCategoryIcon(tool.category);
  const formattedDate = format(new Date(tool.dateAdded), 'MMM d, yyyy');
  
  const categoryDisplay = tool.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const categoryColor = {
    "text-generation": "blue",
    "image-generation": "purple",
    "code-assistant": "green",
    "productivity": "orange",
    "research": "cyan",
    "professional-development": "blue",
    "personal-development": "purple",
    "education": "green",
    "healthcare": "pink",
    "other": "gray"
  }[tool.category] || "blue";

  // Format suggestions as list items if they contain commas
  const formatSuggestions = (suggestions: string) => {
    if (suggestions.includes(',')) {
      return suggestions.split(',').map(s => s.trim());
    }
    return [suggestions];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="modal-content bg-glass-dark rounded-xl overflow-hidden shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-white border-opacity-40 animate-in fade-in">
        <div className="p-0">
          <div className="relative">
            <div className={`h-60 bg-gradient-to-br ${from} ${to} flex items-center justify-center`}>
              <CategoryIcon className="w-24 h-24 text-white" />
            </div>
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 bg-black bg-opacity-20 rounded-full p-1.5"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-400">{tool.name}</h2>
              <span className={`px-2.5 py-1 bg-${categoryColor}-100 text-${categoryColor}-800 rounded-md text-sm font-medium`}>
                {categoryDisplay}
              </span>
            </div>
            
            <p className="text-gray-700 mb-5 dark:text-white">{tool.description}</p>
            
            {/* Provider Information */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-apple-gray mb-2">PROVIDER</h3>
              <div className="flex items-center">
                {tool.provider === 'kainbridge' ? (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Kainbridge (First Party)
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Third-Party
                  </span>
                )}
              </div>
            </div>
            
            {/* AI-powered usage suggestions */}
            <div className="mb-5">
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-medium text-apple-gray">SMART SUGGESTIONS</h3>
                <Sparkles className="w-4 h-4 text-amber-500 ml-1" />
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-gray-700 text-sm border border-blue-100">
                {isFetchingSuggestions ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 text-apple-blue animate-spin mr-2" />
                    <span className="text-apple-gray">Generating AI suggestions...</span>
                  </div>
                ) : aiSuggestions ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {formatSuggestions(aiSuggestions).map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Try exploring this tool to discover its capabilities.</p>
                )}
              </div>
            </div>
            
            <div className="mb-5">
              <h3 className="text-sm font-medium text-apple-gray mb-2">TAGS</h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag, index) => (
                  <span key={index} className="px-2.5 py-1 bg-gray-100 text-apple-gray rounded-full text-sm">
                    {tag}
                  </span>
                ))}
                {tool.tags.length === 0 && (
                  <span className="text-sm text-apple-gray italic">No tags added</span>
                )}
              </div>
            </div>
            
            <div className="mb-5">
              <h3 className="text-sm font-medium text-apple-gray mb-2">NOTES</h3>
              <div className="bg-gray-100 rounded-lg p-3 text-gray-700 text-sm">
                {tool.notes || 'No notes added'}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <div>
                <h3 className="text-xs font-medium text-apple-gray mb-1">ADDED</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{formattedDate}</p>
              </div>
              <a 
                href={tool.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-apple-blue text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Open Tool
              </a>
            </div>
            
            {!readOnly && (
              <div className="mt-6 flex space-x-3">
                <button 
                  type="button" 
                  onClick={onEdit}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 flex justify-center items-center"
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit
                </button>
                <button 
                  type="button" 
                  onClick={onDelete}
                  className="flex-1 px-4 py-2.5 bg-red-100 text-apple-red rounded-lg font-medium hover:bg-red-200 transition-colors duration-200 flex justify-center items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
