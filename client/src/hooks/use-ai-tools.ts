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
      const response = await apiRequest('POST', '/api/tools', toolData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });
  
  // Mutation to update an existing AI tool
  const { mutateAsync: updateAiTool, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: AiToolFormData }) => {
      const response = await apiRequest('PUT', `/api/tools/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
  });
  
  // Mutation to delete an AI tool
  const { mutateAsync: deleteAiTool, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tools/${id}`);
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
