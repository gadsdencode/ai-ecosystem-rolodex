import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiTool, CategoryType, ColorType, ProviderType, DevelopmentStatusType, aiToolFormSchema } from '@shared/schema';
import { X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { COLOR_GRADIENTS } from '../types';
import { autoCategorizeAiTool, suggestTags } from '../lib/xai';
import { useToast } from '../hooks/use-toast';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AddEditModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  currentTool: AiTool | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddEditModal({ isOpen, mode, currentTool, onClose, onSubmit }: AddEditModalProps) {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(aiToolFormSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      category: 'text-generation' as CategoryType,
      tags: '',
      notes: '',
      iconColor: 'blue' as ColorType,
      provider: 'third-party' as ProviderType,
      developmentStatus: 'production' as DevelopmentStatusType,
    }
  });

  const description = watch('description');

  useEffect(() => {
    if (currentTool && mode === 'edit') {
      reset({
        name: currentTool.name,
        description: currentTool.description,
        url: currentTool.url,
        category: currentTool.category as CategoryType,
        tags: currentTool.tags.join(', '),
        notes: currentTool.notes || '',
        iconColor: currentTool.iconColor as ColorType,
        provider: currentTool.provider as ProviderType || 'third-party',
        developmentStatus: currentTool.developmentStatus as DevelopmentStatusType || 'production',
      });
    } else if (mode === 'add') {
      reset({
        name: '',
        description: '',
        url: '',
        category: 'text-generation' as CategoryType,
        tags: '',
        notes: '',
        iconColor: 'blue' as ColorType,
        provider: 'third-party' as ProviderType,
        developmentStatus: 'production' as DevelopmentStatusType,
      });
    }
  }, [currentTool, mode, isOpen, reset]);

  const handleFormSubmit = (data: any) => {
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
    
    console.log('Form data before submission:', data);
    onSubmit(data);
  };

  const handleAiAssist = async () => {
    if (!description || description.trim().length < 10) {
      toast({
        title: "Description too short",
        description: "Please enter a detailed description for better AI suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsAiProcessing(true);
    
    try {
      const [category, tags] = await Promise.all([
        autoCategorizeAiTool(description),
        suggestTags(description)
      ]);
      
      setValue('category', category);
      setValue('tags', tags.join(', '));
      
      toast({
        title: "AI suggestions applied",
        description: "Category and tags have been suggested based on your description.",
      });
    } catch (error) {
      console.error('AI assist error:', error);
      toast({
        title: "AI suggestion failed",
        description: "Could not generate suggestions. Please try again or fill in manually.",
        variant: "destructive"
      });
    } finally {
      setIsAiProcessing(false);
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

  if (!isOpen) return null;

  const inputClasses = `w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
    theme === 'light'
      ? 'bg-white border border-border/50 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 text-foreground'
      : 'bg-slate-800/50 border border-white/10 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 text-white'
  }`;

  const labelClasses = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className={`relative rounded-2xl overflow-hidden shadow-brand-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${
              theme === 'light'
                ? 'bg-white/95 border border-white/50'
                : 'bg-slate-900/95 border border-white/10'
            } backdrop-blur-xl`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-brand">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {mode === 'add' ? 'Add New AI Tool' : 'Edit AI Tool'}
                  </h2>
                </div>
                <button 
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="space-y-4">
                  {/* Tool Name */}
                  <div>
                    <label htmlFor="name" className={labelClasses}>Tool Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      placeholder="e.g., ChatGPT" 
                      className={`${inputClasses} ${errors.name ? 'border-accent-500 focus:border-accent-500' : ''}`}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-accent-500">Name is required</p>
                    )}
                  </div>
                  
                  {/* Tool Description with AI Assist */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
                      <Button
                        type="button"
                        variant={description && !isAiProcessing ? "brand-ghost" : "ghost"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleAiAssist}
                        disabled={!description || isAiProcessing}
                      >
                        {isAiProcessing ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI Assist
                          </>
                        )}
                      </Button>
                    </div>
                    <textarea 
                      id="description" 
                      placeholder="Brief description of what this AI tool does..."
                      rows={3}
                      className={`${inputClasses} resize-none ${errors.description ? 'border-accent-500 focus:border-accent-500' : ''}`}
                      {...register("description")}
                    ></textarea>
                    {errors.description ? (
                      <p className="mt-1.5 text-xs text-accent-500">Description is required</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-muted-foreground">Add a detailed description, then click "AI Assist" for smart suggestions</p>
                    )}
                  </div>
                  
                  {/* Provider & Status Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="provider" className={labelClasses}>Provider</label>
                      <select 
                        id="provider" 
                        className={inputClasses}
                        {...register("provider")}
                      >
                        <option value="overture">Overture (1st Party)</option>
                        <option value="third-party">Third Party</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="developmentStatus" className={labelClasses}>Status</label>
                      <select 
                        id="developmentStatus" 
                        className={inputClasses}
                        {...register("developmentStatus")}
                      >
                        <option value="production">Production</option>
                        <option value="development">In Development</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Tool Category */}
                  <div>
                    <label htmlFor="category" className={labelClasses}>Category</label>
                    <select 
                      id="category" 
                      className={inputClasses}
                      {...register("category")}
                    >
                      <option value="text-generation">Text Generation</option>
                      <option value="image-generation">Image Generation</option>
                      <option value="code-assistant">Code Assistant</option>
                      <option value="productivity">Productivity</option>
                      <option value="research">Research</option>
                      <option value="professional-development">Professional Development</option>
                      <option value="personal-development">Personal Development</option>
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {/* Tool URL */}
                  <div>
                    <label htmlFor="url" className={labelClasses}>URL</label>
                    <input 
                      type="url" 
                      id="url" 
                      placeholder="https://..." 
                      className={`${inputClasses} ${errors.url ? 'border-accent-500 focus:border-accent-500' : ''}`}
                      {...register("url")}
                    />
                    {errors.url && (
                      <p className="mt-1.5 text-xs text-accent-500">Please enter a valid URL</p>
                    )}
                  </div>
                  
                  {/* Tool Tags */}
                  <div>
                    <label htmlFor="tags" className={labelClasses}>Tags (comma separated)</label>
                    <input 
                      type="text" 
                      id="tags" 
                      placeholder="e.g., writing, research, conversation"
                      className={inputClasses}
                      {...register("tags")}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">AI Assist will suggest tags based on your description</p>
                  </div>
                  
                  {/* Tool Notes */}
                  <div>
                    <label htmlFor="notes" className={labelClasses}>Usage Notes (Optional)</label>
                    <textarea 
                      id="notes" 
                      placeholder="Any personal notes on how you use this tool..."
                      rows={2}
                      className={`${inputClasses} resize-none`}
                      {...register("notes")}
                    ></textarea>
                  </div>
                  
                  {/* Icon Color */}
                  <div>
                    <label className={labelClasses}>Icon Color</label>
                    <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30">
                      {(Object.keys(COLOR_GRADIENTS) as ColorType[]).map((color) => (
                        <label key={color} className="relative cursor-pointer group">
                          <input 
                            type="radio" 
                            value={color}
                            className="sr-only peer" 
                            {...register("iconColor")}
                          />
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${COLOR_GRADIENTS[color].from} ${COLOR_GRADIENTS[color].to} transition-all duration-200 peer-checked:ring-2 peer-checked:ring-primary-500 peer-checked:ring-offset-2 peer-checked:ring-offset-background group-hover:scale-110`} />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="brand"
                    className="flex-1"
                  >
                    {mode === 'add' ? 'Add Tool' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
