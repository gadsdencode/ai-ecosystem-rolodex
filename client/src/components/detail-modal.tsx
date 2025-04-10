import { useEffect, useState } from 'react';
import { AiTool } from '@shared/schema';
import { COLOR_GRADIENTS } from '../types';
import { getCategoryIcon } from '../lib/icons';
import { format } from 'date-fns';
import { ExternalLink, Edit, Trash2, X, Sparkles, Loader2, Server, Code, ChevronUp, ChevronDown } from 'lucide-react';
import { generateToolSuggestions } from '../lib/xai';

interface DetailModalProps {
  isOpen: boolean;
  tool: AiTool | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
  onChangeStatus?: (tool: AiTool, newStatus: 'production' | 'development') => void;
}

export function DetailModal({ isOpen, tool, onClose, onEdit, onDelete, readOnly = false, onChangeStatus }: DetailModalProps) {
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Fetch AI-powered tool suggestions when modal opens
  useEffect(() => {
    if (isOpen && tool && !aiSuggestions) {
      handleGenerateSuggestions();
    }
    // Reset state when modal closes
    if (!isOpen) {
      setAiSuggestions(null);
    }
  }, [isOpen, tool]);

  const handleGenerateSuggestions = async () => {
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
    <>
      {isOpen && tool && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="modal-content bg-glass-dark rounded-xl overflow-hidden shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white border-opacity-40 animate-in fade-in">
            <div className="relative">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-white p-1.5 rounded-full bg-black bg-opacity-20 hover:bg-opacity-30 transition-colors z-10"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Header section with gradient background */}
              <div 
                className={`p-8 pb-16 bg-gradient-to-br ${from} ${to}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <CategoryIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{tool.name}</h2>
                      
                      {/* Provider Badge */}
                      {tool.provider === 'overture' ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Overture
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          Third Party
                        </span>
                      )}
                      
                      {/* Development Status Badge */}
                      <span 
                        className={`px-2 py-0.5 ${
                          tool.developmentStatus === 'development' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        } text-xs font-medium rounded-full flex items-center`}
                      >
                        {tool.developmentStatus === 'development' ? (
                          <>
                            <Code className="w-3 h-3 mr-1" />
                            In Development
                          </>
                        ) : (
                          <>
                            <Server className="w-3 h-3 mr-1" />
                            Production
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="text-white text-opacity-90 line-clamp-2">{tool.description}</div>
                  </div>
                </div>
              </div>
              
              {/* Content section */}
              <div className="p-6 -mt-8 bg-white rounded-t-xl">
                {/* Action buttons */}
                <div className="flex justify-between mb-6">
                  <div className="flex space-x-2">
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-apple-blue text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Open Tool
                    </a>
                    
                    {/* Status Change Button for Admin */}
                    {!readOnly && onChangeStatus && (
                      <>
                        {tool.developmentStatus === 'development' ? (
                          <button 
                            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center hover:bg-blue-100 transition-colors duration-200" 
                            onClick={() => onChangeStatus(tool, 'production')}
                          >
                            <ChevronUp className="w-4 h-4 mr-1.5" />
                            Move to Production
                          </button>
                        ) : (
                          <button 
                            className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg flex items-center hover:bg-orange-100 transition-colors duration-200" 
                            onClick={() => onChangeStatus(tool, 'development')}
                          >
                            <ChevronDown className="w-4 h-4 mr-1.5" />
                            Move to Development
                          </button>
                        )}
                      </>
                    )}
                    
                    {!readOnly && (
                      <>
                        <button 
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center hover:bg-gray-200 transition-colors duration-200" 
                          onClick={onEdit}
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          Edit
                        </button>
                        
                        <button 
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center hover:bg-red-100 transition-colors duration-200" 
                          onClick={onDelete}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* AI related buttons - only shown for admins */}
                  {!readOnly && (
                    <button
                      className={`px-4 py-2 text-sm ${
                        isFetchingSuggestions 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      } border border-purple-200 rounded-lg flex items-center transition-colors duration-200`}
                      onClick={handleGenerateSuggestions}
                      disabled={isFetchingSuggestions}
                    >
                      {isFetchingSuggestions ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1.5" />
                          AI Suggestions
                        </>
                      )}
                    </button>
                  )}
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
                
                {/* TAGS section - was already present */}
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
                
                {/* NOTES section - was already present */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
