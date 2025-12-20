import { useState, useMemo } from 'react';
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

// Options interface for the hook
interface UseAiToolsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  developmentStatus?: string;
}

// Helper function to ensure tags are always an array
function ensureTagsArray(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  return tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useAiTools(options?: UseAiToolsOptions) {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0
  });
  
  // Determine API parameters based on category value
  // 'overture' and 'third-party' are provider filters, not category filters
  const apiParams = useMemo(() => {
    let categoryParam: string | undefined;
    let providerParam: string | undefined;
    
    if (options?.category === 'overture' || options?.category === 'third-party') {
      providerParam = options.category;
      categoryParam = undefined;
    } else if (options?.category && options.category !== 'all') {
      categoryParam = options.category;
      providerParam = undefined;
    }
    
    return { categoryParam, providerParam };
  }, [options?.category]);
  
  // Build query string with pagination and filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', pagination.limit.toString());
    params.set('offset', pagination.offset.toString());
    
    if (options?.search?.trim()) {
      params.set('search', options.search.trim());
    }
    if (apiParams.categoryParam) {
      params.set('category', apiParams.categoryParam);
    }
    if (apiParams.providerParam) {
      params.set('provider', apiParams.providerParam);
    }
    if (options?.developmentStatus && options.developmentStatus !== 'all') {
      params.set('developmentStatus', options.developmentStatus);
    }
    
    return `?${params.toString()}`;
  }, [pagination.limit, pagination.offset, options?.search, apiParams.categoryParam, apiParams.providerParam, options?.developmentStatus]);
  
  // Query to fetch all AI tools with retry logic, pagination, and filtering
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/tools', pagination, options?.search, options?.category, options?.developmentStatus],
    queryFn: () => apiRequest<PaginatedResponse<AiTool>>(`/api/tools${queryString}`),
    retry: MAX_RETRIES,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
  
  // Extract data from paginated response
  const aiTools = response?.data ?? [];
  const total = response?.total ?? 0;
  
  if (error) {
    console.error('API error:', error);
  }
  
  const { mutateAsync: addAiTool, isPending: isAdding } = useMutation({
    mutationFn: async (toolData: AiToolFormData) => {
      const formattedData = {
        ...toolData,
        tags: ensureTagsArray(toolData.tags as string | string[])
      };
      
      console.log('Formatted data for API submission:', formattedData);
      
      return await apiRequest<AiTool>('/api/tools', {
        method: 'POST',
        body: formattedData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
    retry: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
  });
  
  const { mutateAsync: updateAiTool, isPending: isUpdating } = useMutation({
    mutationFn: async (params: { id: number, data: AiToolFormData } | [number, AiToolFormData]) => {
      let id: number;
      let data: AiToolFormData;
      
      if (Array.isArray(params)) {
        [id, data] = params;
      } else {
        ({ id, data } = params);
      }
      
      const formattedData = {
        ...data,
        tags: ensureTagsArray(data.tags as string | string[])
      };
      
      console.log('Formatted data for API update:', formattedData);
      
      return await apiRequest<AiTool>(`/api/tools/${id}`, {
        method: 'PUT',
        body: formattedData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
    retry: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
  });
  
  const { mutateAsync: deleteAiTool, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/tools/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
    retry: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
  });

  const { mutateAsync: updateToolStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'production' | 'development' }) => {
      const tool = aiTools.find(t => t.id === id);
      if (!tool) throw new Error('Tool not found');
      
      const formattedData = {
        name: tool.name,
        description: tool.description,
        url: tool.url,
        category: tool.category,
        tags: tool.tags,
        notes: tool.notes || '',
        iconColor: tool.iconColor,
        provider: tool.provider,
        developmentStatus: status
      };
      
      return await apiRequest<AiTool>(`/api/tools/${id}`, {
        method: 'PUT',
        body: formattedData
      });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/tools'] });
      
      const previousTools = queryClient.getQueryData<AiTool[]>(['/api/tools']);
      
      queryClient.setQueryData<AiTool[]>(['/api/tools'], (old) => 
        old?.map(tool => 
          tool.id === id 
            ? { ...tool, developmentStatus: status }
            : tool
        ) || []
      );
      
      return { previousTools };
    },
    onError: (err, variables, context) => {
      if (context?.previousTools) {
        queryClient.setQueryData(['/api/tools'], context.previousTools);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
    },
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
    updateToolStatus,
    isAdding,
    isUpdating,
    isDeleting,
    isUpdatingStatus,
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
