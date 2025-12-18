import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiTool, AiToolFormData } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

// Paginated response from API
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Helper function to ensure tags are always an array
function ensureTagsArray(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  // If it's a string, split by comma and trim
  return tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
}

// Max retry attempts for client-side operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useAiTools(options?: { limit?: number; offset?: number }) {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0
  });
  
  // Build query string for pagination
  const queryString = `?limit=${pagination.limit}&offset=${pagination.offset}`;
  
  // Query to fetch all AI tools with retry logic and pagination
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/tools', pagination],
    queryFn: () => apiRequest<PaginatedResponse<AiTool>>(`/api/tools${queryString}`),
    retry: MAX_RETRIES,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
  
  // Extract data from paginated response
  const aiTools = response?.data ?? [];
  const total = response?.total ?? 0;
  
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
    retry: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
  });
  
  // Mutation to update an existing AI tool
  const { mutateAsync: updateAiTool, isPending: isUpdating } = useMutation({
    mutationFn: async (params: { id: number, data: AiToolFormData } | [number, AiToolFormData]) => {
      try {
        // Handle different parameter formats (object or array)
        let id: number;
        let data: AiToolFormData;
        
        if (Array.isArray(params)) {
          // If called as updateAiTool(id, data)
          [id, data] = params;
        } else {
          // If called as updateAiTool({ id, data })
          ({ id, data } = params);
        }
        
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
    retry: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
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
    retry: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
  });
  
  // Pagination controls
  const setPage = (page: number) => {
    setPagination(prev => ({
      ...prev,
      offset: page * prev.limit
    }));
  };
  
  const setPageSize = (newLimit: number) => {
    setPagination(prev => ({
      limit: newLimit,
      offset: 0 // Reset to first page when changing page size
    }));
  };
  
  const currentPage = Math.floor(pagination.offset / pagination.limit);
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    aiTools,
    isLoading,
    error,
    refetch,
    addAiTool: (data: AiToolFormData) => addAiTool(data),
    updateAiTool: (id: number, data: AiToolFormData) => updateAiTool([id, data]),
    deleteAiTool,
    isAdding,
    isUpdating,
    isDeleting,
    // Pagination
    pagination: {
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      currentPage,
      totalPages,
      setPage,
      setPageSize,
      hasNextPage: currentPage < totalPages - 1,
      hasPrevPage: currentPage > 0
    }
  };
}
