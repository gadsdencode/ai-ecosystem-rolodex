import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff capped at 30 seconds
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: import.meta.env.PROD, // Only in production
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

/**
 * Enhanced API request function with better error handling
 * @param url The endpoint URL (relative to API base)
 * @param options Fetch options
 * @returns Parsed JSON response
 */
interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
  
  const { body, ...restOptions } = options;
  
  const requestOptions: RequestInit = { 
    ...restOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  if (body !== undefined) {
    requestOptions.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
  }
  
  try {
    // Make the fetch request
    const response = await fetch(apiUrl, requestOptions);
    
    // Get response as text first
    const text = await response.text();
    
    // Try to parse as JSON if not empty
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn('Response is not valid JSON:', text);
      data = { message: 'Invalid response format', rawText: text };
    }
    
    // Handle error responses
    if (!response.ok) {
      // Enhance error with status and additional details
      const error: any = new Error(data.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = data;
      
      // Special handling for specific error status codes
      if (response.status === 503) {
        error.isConnectionError = true;
        error.message = 'Database connection error. Please try again in a moment.';
        console.error('Database connection error detected');
      }
      
      throw error;
    }
    
    return data as T;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      const networkError: any = new Error('Network connection error. Please check your internet connection.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    
    // Re-throw all other errors
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
