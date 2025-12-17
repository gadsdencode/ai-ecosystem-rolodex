import { useEffect, useState } from 'react';
import { AiTool } from '@shared/schema';
import { COLOR_GRADIENTS } from '../types';
import { getCategoryIcon } from '../lib/icons';
import { format } from 'date-fns';
import { ExternalLink, Edit, Trash2, X, Sparkles, Loader2, Server, Code, ChevronUp, ChevronDown, Calendar, Tag } from 'lucide-react';
import { generateToolSuggestions } from '../lib/xai';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen && tool && !aiSuggestions) {
      handleGenerateSuggestions();
    }
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

  const formatSuggestions = (suggestions: string) => {
    if (suggestions.includes(',')) {
      return suggestions.split(',').map(s => s.trim());
    }
    return [suggestions];
  };

  return (
    <AnimatePresence>
      {isOpen && tool && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className={`relative rounded-2xl overflow-hidden shadow-brand-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
              theme === 'light'
                ? 'bg-white/95 border border-white/50'
                : 'bg-slate-900/95 border border-white/10'
            } backdrop-blur-xl`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors backdrop-blur-sm"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Gradient Header */}
            <div className={`relative p-8 pb-20 bg-gradient-to-br ${from} ${to}`}>
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent_60%)]" />
              
              <div className="relative flex items-start gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                  <CategoryIcon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">{tool.name}</h2>
                    
                    {/* Provider Badge */}
                    <Badge variant={tool.provider === 'overture' ? 'overture' : 'third-party'}>
                      {tool.provider === 'overture' ? 'OVERTURE' : 'Third Party'}
                    </Badge>
                    
                    {/* Status Badge */}
                    <Badge variant={tool.developmentStatus === 'development' ? 'development' : 'production'}>
                      {tool.developmentStatus === 'development' ? (
                        <><Code className="w-3 h-3 mr-1" />DEV</>
                      ) : (
                        <><Server className="w-3 h-3 mr-1" />PROD</>
                      )}
                    </Badge>
                  </div>
                  
                  <p className="text-white/90 line-clamp-2">{tool.description}</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className={`p-6 -mt-12 rounded-t-3xl relative ${
              theme === 'light' ? 'bg-white' : 'bg-slate-900'
            }`}>
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button variant="brand" asChild>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Open Tool
                  </a>
                </Button>
                
                {/* Status Change Button */}
                {!readOnly && onChangeStatus && (
                  <>
                    {tool.developmentStatus === 'development' ? (
                      <Button 
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => onChangeStatus(tool, 'production')}
                      >
                        <ChevronUp className="w-4 h-4 mr-1.5" />
                        Move to Production
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        onClick={() => onChangeStatus(tool, 'development')}
                      >
                        <ChevronDown className="w-4 h-4 mr-1.5" />
                        Move to Development
                      </Button>
                    )}
                  </>
                )}
                
                {!readOnly && (
                  <>
                    <Button variant="outline" onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-accent-500/30 text-accent-500 hover:bg-accent-500/10"
                      onClick={onDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </>
                )}
                
                {/* AI Suggestions Button */}
                {!readOnly && (
                  <Button
                    variant={isFetchingSuggestions ? "ghost" : "glow-purple"}
                    size="sm"
                    className="ml-auto"
                    onClick={handleGenerateSuggestions}
                    disabled={isFetchingSuggestions}
                  >
                    {isFetchingSuggestions ? (
                      <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Loading...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-1.5" />AI Suggestions</>
                    )}
                  </Button>
                )}
              </div>
              
              {/* AI Suggestions Section */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-secondary-500" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Smart Suggestions</h3>
                </div>
                <div className={`rounded-xl p-4 border ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100'
                    : 'bg-gradient-to-br from-primary-950/50 to-secondary-950/50 border-primary-800/30'
                }`}>
                  {isFetchingSuggestions ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="w-5 h-5 text-primary-500 animate-spin mr-2" />
                      <span className="text-muted-foreground">Generating AI suggestions...</span>
                    </div>
                  ) : aiSuggestions ? (
                    <ul className="space-y-2">
                      {formatSuggestions(aiSuggestions).map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-secondary-500 mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Try exploring this tool to discover its capabilities.</p>
                  )}
                </div>
              </div>
              
              {/* Tags Section */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.length > 0 ? (
                    tool.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No tags added</span>
                  )}
                </div>
              </div>
              
              {/* Notes Section */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes</h3>
                <div className={`rounded-xl p-4 ${
                  theme === 'light' ? 'bg-muted/50' : 'bg-muted/30'
                }`}>
                  <p className="text-sm text-foreground">
                    {tool.notes || 'No notes added'}
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Added on</span>
                <span className="font-mono text-foreground">{formattedDate}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
