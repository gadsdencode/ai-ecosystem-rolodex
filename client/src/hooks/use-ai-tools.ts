import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiTool, AiToolFormData } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

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
        return await apiRequest<AiTool>('/api/tools', {
          method: 'POST',
          body: toolData
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
        return await apiRequest<AiTool>(`/api/tools/${id}`, {
          method: 'PUT',
          body: data
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
    aiTools,
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
