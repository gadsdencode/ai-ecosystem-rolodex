import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiTool, CategoryType, ColorType, ProviderType, aiToolFormSchema } from '@shared/schema';
import { X, Wand2, Loader2 } from 'lucide-react';
import { COLOR_GRADIENTS } from '../types';
import { autoCategorizeAiTool, suggestTags } from '../lib/xai';
import { useToast } from '../hooks/use-toast';

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
    }
  });

  // Watch the description field to enable/disable AI assist button
  const description = watch('description');

  // Update form when currentTool changes or when modal opens
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
      });
    }
  }, [currentTool, mode, isOpen, reset]);

  const handleFormSubmit = (data: any) => {
    // Ensure tags are properly formatted for submission
    // Convert comma-separated string to array if not already
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
    
    console.log('Form data before submission:', data);
    onSubmit(data);
  };

  // AI assist functionality to categorize and suggest tags
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
      // Run both operations in parallel for efficiency
      const [category, tags] = await Promise.all([
        autoCategorizeAiTool(description),
        suggestTags(description)
      ]);
      
      // Update form values with AI suggestions
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="modal-content bg-glass-dark rounded-xl overflow-hidden shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-white border-opacity-40 animate-in fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'add' ? 'Add New AI Tool' : 'Edit AI Tool'}
            </h2>
            <button 
              className="text-apple-gray hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="space-y-4">
              {/* Tool Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="e.g., ChatGPT" 
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">Name is required</p>
                )}
              </div>
              
              {/* Tool Description with AI Assist */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <button
                    type="button"
                    className={`text-xs flex items-center space-x-1 py-1 px-2 rounded-md transition-colors duration-200 ${
                      !description || isAiProcessing 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20'
                    }`}
                    onClick={handleAiAssist}
                    disabled={!description || isAiProcessing}
                  >
                    {isAiProcessing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3" />
                        <span>AI Assist</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea 
                  id="description" 
                  placeholder="Brief description of what this AI tool does..."
                  rows={3}
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900 resize-none`}
                  {...register("description")}
                ></textarea>
                {errors.description ? (
                  <p className="mt-1 text-xs text-red-500">Description is required</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Add a detailed description, then click "AI Assist" for smart suggestions</p>
                )}
              </div>
              
              {/* Provider Selection */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select 
                  id="provider" 
                  className={`w-full px-3 py-2 border ${errors.provider ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900`}
                  {...register("provider")}
                >
                  <option value="overture">Overture (1st Party)</option>
                  <option value="third-party">Third Party</option>
                </select>
                {errors.provider && (
                  <p className="mt-1 text-xs text-red-500">Please select a valid provider</p>
                )}
              </div>
              
              {/* Tool Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  id="category" 
                  className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900`}
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
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">Please select a valid category</p>
                )}
              </div>
              
              {/* Tool URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input 
                  type="url" 
                  id="url" 
                  placeholder="https://..." 
                  className={`w-full px-3 py-2 border ${errors.url ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900`}
                  {...register("url")}
                />
                {errors.url && (
                  <p className="mt-1 text-xs text-red-500">Please enter a valid URL</p>
                )}
              </div>
              
              {/* Tool Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input 
                  type="text" 
                  id="tags" 
                  placeholder="e.g., writing, research, conversation"
                  className={`w-full px-3 py-2 border ${errors.tags ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900`}
                  {...register("tags")}
                />
                {errors.tags ? (
                  <p className="mt-1 text-xs text-red-500">Please enter valid tags</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">AI Assist will suggest tags based on your description</p>
                )}
              </div>
              
              {/* Tool Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Usage Notes (Optional)</label>
                <textarea 
                  id="notes" 
                  placeholder="Any personal notes on how you use this tool..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-apple-blue focus:border-apple-blue bg-white text-gray-900 resize-none"
                  {...register("notes")}
                ></textarea>
              </div>
              
              {/* Icon Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Background Color</label>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(COLOR_GRADIENTS) as ColorType[]).map((color) => (
                    <div key={color} className="flex items-center">
                      <input 
                        type="radio" 
                        id={`color${color.charAt(0).toUpperCase() + color.slice(1)}`} 
                        value={color}
                        className="h-4 w-4 text-apple-blue" 
                        {...register("iconColor")}
                      />
                      <label htmlFor={`color${color.charAt(0).toUpperCase() + color.slice(1)}`} className="ml-2 flex items-center">
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${COLOR_GRADIENTS[color].from} ${COLOR_GRADIENTS[color].to}`}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button 
                type="button" 
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-2.5 bg-apple-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                {mode === 'add' ? 'Add Tool' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
