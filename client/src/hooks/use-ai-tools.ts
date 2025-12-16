import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiTool, AiToolFormData } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

function ensureTagsArray(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  return tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useAiTools() {
  const queryClient = useQueryClient();
  
  const { 
    data: aiTools = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: () => apiRequest<AiTool[]>('/api/tools'),
    retry: MAX_RETRIES,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
  
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
  
  return {
    aiTools: aiTools as AiTool[],
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
  };
}
