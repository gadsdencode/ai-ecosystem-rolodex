import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiTool, AiToolFormData } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

// Helper function to ensure tags are always an array
function ensureTagsArray(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  // If it's a string, split by comma and trim
  return tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
}

export function useAiTools() {
  const queryClient = useQueryClient();
  
  // Query to fetch all AI tools
  const { 
    data: aiTools = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/tools'],
  });
  
  // Mutation to add a new AI tool
  const { mutateAsync: addAiTool, isPending: isAdding } = useMutation({
    mutationFn: async (toolData: AiToolFormData) => {
      try {
        // Ensure tags is always an array before sending
        const formattedData = {
          ...toolData,
          tags: ensureTagsArray(toolData.tags as any) // Use type assertion to avoid TS errors
        };
        
        console.log('Formatted data for API submission:', formattedData);
        
        return await apiRequest<AiTool>('/api/tools', {
          method: 'POST',
          body: formattedData
        });
      } catch (error) {
        console.error("Error adding AI tool:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });
  
  // Mutation to update an existing AI tool
  const { mutateAsync: updateAiTool, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: AiToolFormData }) => {
      try {
        // Ensure tags is always an array before sending
        const formattedData = {
          ...data,
          tags: ensureTagsArray(data.tags as any) // Use type assertion to avoid TS errors
        };
        
        console.log('Formatted data for API update:', formattedData);
        
        return await apiRequest<AiTool>(`/api/tools/${id}`, {
          method: 'PUT',
          body: formattedData
        });
      } catch (error) {
        console.error("Error updating AI tool:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });
  
  // Mutation to delete an AI tool
  const { mutateAsync: deleteAiTool, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiRequest(`/api/tools/${id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error("Error deleting AI tool:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });
  
  return {
    aiTools: aiTools as AiTool[], // Type assertion to fix 'unknown' type
    isLoading,
    error,
    addAiTool: (data: AiToolFormData) => addAiTool(data),
    updateAiTool: (id: number, data: AiToolFormData) => updateAiTool({ id, data }),
    deleteAiTool,
    isAdding,
    isUpdating,
    isDeleting,
  };
}
